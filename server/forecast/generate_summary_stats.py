import os

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=os.path.abspath(env_path))


MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")

# print(f"MONGO_URI: {MONGO_URI}")
# print(f"MONGO_DB: {MONGO_DB}")
# print(f"MONGO_COLLECTION: {MONGO_COLLECTION}")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[MONGO_COLLECTION]

def generate_summary_stats(input_path='final_output_with_nan2.csv'):
    df = pd.read_csv(input_path)
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    for item, group in df.groupby('Item_Code'):
        group = group.sort_values('YearMonth')
        group = group.dropna(subset=['Order_Qty'])

        if len(group) < 6:
            continue

        order_qtys = group['Order_Qty'].values
        mean_qty = np.mean(order_qtys)
        std_qty = np.std(order_qtys)
        last_6 = order_qtys[-6:].tolist()

        X = np.arange(len(group)).reshape(-1, 1)
        y = group['Order_Qty'].values
        model = LinearRegression().fit(X, y)
        slope = model.coef_[0]
        intercept = model.intercept_

        group['MonthNum'] = group['YearMonth'].dt.month
        seasonality = group.groupby('MonthNum')['Order_Qty'].mean().to_dict()

        summary_doc = {
            "Item_Code": item,
            "mean_qty": round(mean_qty, 2),
            "std_dev_qty": round(std_qty, 2),
            "slope": round(slope, 4),
            "intercept": round(intercept, 2),
            "last_6_months": last_6,
            "seasonality": {str(k): round(v, 2) for k, v in seasonality.items()},
            "last_updated": group['YearMonth'].max().strftime('%Y-%m-%d')
        }

        # Upsert into MongoDB
        collection.update_one({"Item_Code": item}, {"$set": summary_doc}, upsert=True)

def update_summary_with_new_month(new_data_csv):
    new_df = pd.read_csv(new_data_csv)
    new_df['YearMonth'] = pd.to_datetime(new_df['YearMonth'])
    new_df['MonthNum'] = new_df['YearMonth'].dt.month

    target_month = new_df['YearMonth'].max().strftime('%Y-%m-%d')

    # Check if data for this month already exists
    exists = collection.find_one({"last_updated": target_month})
    if exists:
        return list(collection.find({}, {'_id': 0}))

    for _, row in new_df.iterrows():
        item = row['Item_Code']
        qty = row['Order_Qty']
        month = str(row['MonthNum'])
        date_str = row['YearMonth'].strftime('%Y-%m-%d')

        doc = collection.find_one({"Item_Code": item})
        if not doc:
            continue

        last6 = doc.get('last_6_months', [])
        if len(last6) >= 6:
            last6.pop(0)
        last6.append(qty)

        mean_qty = round(np.mean(last6), 2)
        std_qty = round(np.std(last6), 2)

        if len(last6) >= 2:
            X = np.arange(len(last6)).reshape(-1, 1)
            y = np.array(last6)
            model = LinearRegression().fit(X, y)
            slope = round(model.coef_[0], 4)
            intercept = round(model.intercept_, 2)
        else:
            slope = doc.get("slope", 0)
            intercept = doc.get("intercept", 0)

        seasonality = doc.get('seasonality', {})
        prev = seasonality.get(month, qty)
        updated = (prev + qty) / 2
        seasonality[month] = round(updated, 2)

        # Update doc
        updated_doc = {
            "mean_qty": mean_qty,
            "std_dev_qty": std_qty,
            "slope": slope,
            "intercept": intercept,
            "last_6_months": last6,
            "seasonality": seasonality,
            "last_updated": date_str
        }

        collection.update_one({"Item_Code": item}, {"$set": updated_doc})

    return list(collection.find({}, {'_id': 0}))

def predict_next_month_quantities(forecast_month='2025-04'):
    month_num = int(forecast_month.split('-')[1])
    summaries = list(collection.find({}, {'_id': 0}))

    predictions = []

    for stats in summaries:
        last6 = stats.get('last_6_months', [])
        if len(last6) < 2:
            continue

        recent_avg = np.mean(last6)
        slope = stats.get('slope', 0)
        intercept = stats.get('intercept', 0)
        trend_estimate = slope * len(last6) + intercept

        seasonality = stats.get('seasonality', {})
        seasonal_factor = seasonality.get(str(month_num), stats['mean_qty'])
        seasonal_boost = seasonal_factor - stats['mean_qty']

        predicted_qty = trend_estimate + recent_avg + seasonal_boost
        predicted_qty = max(0, round(predicted_qty))

        predictions.append((stats['Item_Code'], predicted_qty))

    predictions.sort(key=lambda x: x[1], reverse=True)
    return predictions

# Example calls (uncomment when needed)
# generate_summary_stats()
# count = collection.count_documents({})
# print(f"✅ MongoDB updated: {count} summary documents inserted.")

# update_summary_with_new_month("orders_march_2025.csv")
# print(predict_next_month_quantities("2025-04"))
