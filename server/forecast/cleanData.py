import pandas as pd
import itertools
import matplotlib.pyplot as plt
import os
import seaborn as sns
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sklearn.metrics import mean_absolute_error
import numpy as np
from prophet import Prophet
import pandas as pd

def addZeros():
    # Step 1: Load and clean data
    df = pd.read_csv('/Users/shivam/Desktop/HTF/orders2.csv')  # Make sure this file has 'Description'
    df['Ship_Date'] = pd.to_datetime(df['Ship_Date'], format='mixed', errors='coerce')
    df = df.dropna(subset=['Ship_Date'])

    # Step 2: Extract Year-Month
    df['YearMonth'] = df['Ship_Date'].dt.to_period('M')

    # Step 3: Group by Item_Code + Month, keeping Order_Qty and Description
    grouped = df.groupby(['Item_Code', 'YearMonth']).agg({
        'Order_Qty': 'sum',
        'Description': lambda x: x.dropna().iloc[0] if not x.dropna().empty else ''
    }).reset_index()

    grouped['YearMonth'] = grouped['YearMonth'].dt.to_timestamp()

    # Step 4: Get all unique item codes and months
    all_items = df['Item_Code'].unique()
    all_months = pd.date_range(start=grouped['YearMonth'].min(),
                               end=grouped['YearMonth'].max(),
                               freq='MS')

    full_index = pd.DataFrame(itertools.product(all_items, all_months),
                              columns=['Item_Code', 'YearMonth'])

    # Step 5: Merge to fill missing months with 0
    final_df = pd.merge(full_index, grouped, on=['Item_Code', 'YearMonth'], how='left')

    # Fill missing values
    final_df['Order_Qty'] = final_df['Order_Qty'].fillna(0).astype(int)
    final_df['Description'] = final_df['Description'].fillna("")

    # Step 6: Add year and month columns
    final_df['Year'] = final_df['YearMonth'].dt.year
    final_df['Month'] = final_df['YearMonth'].dt.month

    # Step 7: Rearrange columns
    final_df = final_df[['Year', 'Month', 'YearMonth', 'Item_Code', 'Description', 'Order_Qty']]

    # Step 8: Sort for readability
    final_df = final_df.sort_values(by=['Year', 'Month', 'Item_Code'])

    # Step 9: Save result
    final_path = '/Users/shivam/Desktop/HTF/final_orders_with_zeros2.csv'
    final_df.to_csv(final_path, index=False)
    # print(f"✅ CSV saved to {final_path}")


def findMisssingMonths():
    # Load and clean data
    df = pd.read_csv('/Users/shivam/Desktop/HTF/orders2.csv')
    df['Ship_Date'] = pd.to_datetime(df['Ship_Date'], format='mixed', errors='coerce')
    df = df.dropna(subset=['Ship_Date'])

    # Extract the month (as Period) from the date
    df['YearMonth'] = df['Ship_Date'].dt.to_period('M')

    # All months that appear in the data
    present_months = set(df['YearMonth'].unique())

    # Create full month range based on min/max dates
    full_range = pd.period_range(start=df['YearMonth'].min(),
                                 end=df['YearMonth'].max(),
                                 freq='M')

    # Find missing months
    missing_months = [month for month in full_range if month not in present_months]

    # Print results
    # if missing_months:
    #     print("📅 Months with NO data at all:")
    #     for m in missing_months:
    #         print(m.strftime('%Y-%m'))
    # else:
    #     print("✅ All months between the first and last date have at least some data.")
import pandas as pd
import itertools

def handleMissingMonths():
    # === Load cleaned data ===
    input_path = '/Users/shivam/Desktop/HTF/final_orders_with_zeros2.csv'
    df = pd.read_csv(input_path)

    # print("✅ Loaded data with columns:", df.columns.tolist())

    # Ensure 'YearMonth' is datetime
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    # Generate all months from min to max date in dataset
    full_months = pd.date_range(start=df['YearMonth'].min(),
                                end=df['YearMonth'].max(),
                                freq='MS')

    # Existing months in the dataset
    existing_months = df['YearMonth'].unique()

    # Find which months are entirely missing
    missing_months = [m for m in full_months if m not in existing_months]

    # Get all unique item codes
    all_items = df['Item_Code'].unique()

    # Prepare item_code → description map safely
    if 'Description' in df.columns:
        item_desc_map = (
            df[df['Description'].notna() & df['Description'].astype(str).str.strip().ne("")]
              .drop_duplicates(subset='Item_Code')
              .set_index('Item_Code')['Description']
              .to_dict()
        )
    else:
        # print("⚠️ Warning: 'Description' column not found. Defaulting to empty descriptions.")
        item_desc_map = {}

    # Create cartesian product of missing months × items
    missing_entries = pd.DataFrame(itertools.product(missing_months, all_items),
                                   columns=['YearMonth', 'Item_Code'])

    # Add Year and Month
    missing_entries['YearMonth'] = pd.to_datetime(missing_entries['YearMonth'])
    missing_entries['Year'] = missing_entries['YearMonth'].dt.year
    missing_entries['Month'] = missing_entries['YearMonth'].dt.month

    # Add NaN quantity and map descriptions
    missing_entries['Order_Qty'] = pd.NA
    missing_entries['Description'] = missing_entries['Item_Code'].map(item_desc_map).fillna("")

    # Reorder columns
    final_columns = ['Year', 'Month', 'YearMonth', 'Item_Code', 'Description', 'Order_Qty']
    missing_entries = missing_entries[final_columns]

    # Merge with original data
    final_df = pd.concat([df, missing_entries], ignore_index=True)

    # Sort and save
    final_df = final_df.sort_values(by=['Year', 'Month', 'Item_Code'])

    output_path = '/Users/shivam/Desktop/HTF/final_output_with_nan2.csv'
    final_df.to_csv(output_path, index=False)
    # print(f"✅ Final dataset saved with NaNs for missing months → {output_path}")



def plotForAtItem2():
    # === Load data inside the function ===
    df = pd.read_csv('/Users/shivam/Desktop/HTF/final_output_with_nan.csv')
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    # === Create output folder ===
    output_dir = '/Users/shivam/Desktop/HTF/item_charts'
    os.makedirs(output_dir, exist_ok=True)

    # === Loop through each unique item ===
    for item in df['Item_Code'].unique():
        item_df = df[df['Item_Code'] == item].sort_values('YearMonth')

        plt.figure(figsize=(10, 4))
        plt.plot(item_df['YearMonth'], item_df['Order_Qty'], marker='o')
        plt.title(f"Monthly Orders for {item}")
        plt.xlabel("Month")
        plt.ylabel("Order Qty")
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.tight_layout()

        # Save plot as image file
        safe_item = item.replace("/", "_").replace("\\", "_")  # avoid invalid filename characters
        plt.savefig(f"{output_dir}/{safe_item}.png")
        plt.close()

    # print(f"Saved plots for {len(df['Item_Code'].unique())} items to → {output_dir}")


def plotForAtItem3():
    # === Load and preprocess data ===
    df = pd.read_csv('/Users/shivam/Desktop/HTF/final_output_with_nan.csv')
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    # === Step 1: Get Top N items ===
    top_n = 10
    top_items = df.groupby('Item_Code')['Order_Qty'].sum().nlargest(top_n).index.tolist()

    # === Step 2: Filter data for those items ===
    filtered_df = df[df['Item_Code'].isin(top_items)]

    # === Step 3: Pivot table: Items vs Months ===
    pivot_df = filtered_df.pivot_table(index='Item_Code',
                                       columns='YearMonth',
                                       values='Order_Qty',
                                       aggfunc='sum',
                                       fill_value=0)

    # === Step 4: Plot heatmap ===
    plt.figure(figsize=(14, 6))
    sns.heatmap(pivot_df, cmap="YlGnBu", annot=True, fmt=".0f", linewidths=0.3, linecolor='gray')

    plt.title(f"🔥 Top {top_n} Selling Items Over Time")
    plt.xlabel("Month")
    plt.ylabel("Item Code")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()


def prophetModel():
    # --- Config ---
    INPUT_FILE = 'final_output_with_nan.csv'
    OUTPUT_DIR = 'prophet_forecasts_all_items'
    FORECAST_MONTHS = 12

    # --- Create output directory ---
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # --- Load and prepare data ---
    df = pd.read_csv(INPUT_FILE)
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    # Get all unique items
    all_items = df['Item_Code'].unique()

    # --- Loop through all items ---
    for item in all_items:
        item_df = df[df['Item_Code'] == item][['YearMonth', 'Order_Qty']].rename(columns={
            'YearMonth': 'ds',
            'Order_Qty': 'y'
        })

        # Remove rows with missing order qty
        item_df = item_df.dropna()

        # Skip if there's not enough data
        if len(item_df) < 6:
            continue

        # Train Prophet model
        model = Prophet()
        try:
            model.fit(item_df)
        except Exception as e:
            # print(f"Could not train Prophet for {item}: {e}")
            continue

        # Forecast next N months
        future = model.make_future_dataframe(periods=FORECAST_MONTHS, freq='MS')
        forecast = model.predict(future)

        # Save forecast CSV
        forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_csv(f'{OUTPUT_DIR}/{item}_forecast.csv', index=False)

        # Plot and save
        fig = model.plot(forecast)
        plt.title(f"Forecast for {item}")
        plt.xlabel("Month")
        plt.ylabel("Order Quantity")
        plt.tight_layout()
        plt.savefig(f"{OUTPUT_DIR}/{item}_forecast_plot.png")
        plt.close()

    # print(f"Forecasts completed for all items. Check the '{OUTPUT_DIR}' folder.")


def printPrediction():
    FORECAST_DIR = 'prophet_forecasts_all_items'

    # Get next month's 1st date (aligned with Prophet's freq='MS')
    next_month = (datetime.today().replace(day=1) + relativedelta(months=1)).strftime('%Y-%m-%d')

    summary = []

    for file in os.listdir(FORECAST_DIR):
        if file.endswith('_forecast.csv'):
            item_code = file.replace('_forecast.csv', '')
            path = os.path.join(FORECAST_DIR, file)
            forecast_df = pd.read_csv(path)

            next_month_row = forecast_df[forecast_df['ds'] == next_month]
            if not next_month_row.empty:
                predicted_qty = round(next_month_row['yhat'].values[0])
                summary.append((item_code, predicted_qty))

    # Sort in descending order of predicted quantity
    summary.sort(key=lambda x: x[1], reverse=True)

    # Print results
    # print("📦 Predicted Order Quantity for Next Month (Rounded & Sorted):")
    # print("-" * 60)
    # for item, qty in summary:
    #     print(f"{item:20s} → {qty}")


def trainSplit():
    # Load your dataset
    df = pd.read_csv("final_output_with_nan.csv")
    df['YearMonth'] = pd.to_datetime(df['YearMonth'])

    results = []

    # Loop over each item
    for item in df['Item_Code'].unique():
        item_df = df[df['Item_Code'] == item][['YearMonth', 'Order_Qty']].rename(columns={
            'YearMonth': 'ds',
            'Order_Qty': 'y'
        }).sort_values('ds')

        item_df = item_df.dropna()
        if len(item_df) < 24:
            continue  # not enough history

        # Train-test split: last 12 months as test
        train = item_df.iloc[:-12]
        test = item_df.iloc[-12:]

        model = Prophet()
        try:
            model.fit(train)
        except:
            continue  # skip problematic items

        # Forecast next 12 months
        future = model.make_future_dataframe(periods=12, freq='MS')
        forecast = model.predict(future)

        # Compare predictions to actual
        forecast_subset = forecast[['ds', 'yhat']].set_index('ds')
        test_subset = test.set_index('ds')
        merged = test_subset.join(forecast_subset, how='left').dropna()

        if not merged.empty:
            mae = mean_absolute_error(merged['y'], merged['yhat'])
            total_actual = merged['y'].sum()
            percentage_error = (mae / total_actual * 100) if total_actual > 0 else np.nan
            results.append((item, round(mae, 2), round(percentage_error, 2)))

    # Convert to DataFrame and show
    results_df = pd.DataFrame(results, columns=['Item_Code', 'MAE', 'Percentage_Error'])
    results_df = results_df.sort_values(by='Percentage_Error')

    # Save or print
    # print(results_df.head(20))
    results_df.to_csv("forecast_error_summary.csv", index=False)


import csv
from datetime import datetime

def addToDB():
    input_csv = "final_output_with_nan2.csv"  # Input file path
    output_csv = "output_items2.csv"          # Output file path

    # Dictionary to store the latest non-zero order (date, qty, description) for each item
    last_positive_order_info = {}

    # Map to store latest known description per item
    item_description_map = {}

    # Set to store all unique item codes
    all_items = set()

    # 1) Read the original CSV
    with open(input_csv, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            item_code = row["Item_Code"].strip()
            description = row.get("Description", "").strip()
            all_items.add(item_code)

            # Update description map
            if item_code not in item_description_map and description:
                item_description_map[item_code] = description

            try:
                order_qty = int(row["Order_Qty"])
            except (ValueError, TypeError):
                continue

            date_str = row["YearMonth"].strip()
            try:
                date_val = datetime.fromisoformat(date_str)
            except ValueError:
                continue

            if order_qty > 0:
                if item_code not in last_positive_order_info:
                    last_positive_order_info[item_code] = (date_val, order_qty, description)
                else:
                    old_date, _, _ = last_positive_order_info[item_code]
                    if date_val > old_date:
                        last_positive_order_info[item_code] = (date_val, order_qty, description)

    # 2) Output fieldnames
    fieldnames = [
        "Object Id",
        "str ItemNo",
        "str ItemName",
        "str Unit",
        "int GrossWeight",
        "int LastRestockQty",
        "Int CurrentQty",
        "date LastRestockDate",
        "str Category",
        "list[] History{ Object Id Purchase }",
        "list[] Complimentary Items{ 1: ObjectId, 2: ObjectId }"
    ]

    # 3) Write the new CSV
    with open(output_csv, mode="w", newline="", encoding="utf-8") as out:
        writer = csv.DictWriter(out, fieldnames=fieldnames)
        writer.writeheader()

        for i, item_code in enumerate(sorted(all_items), start=1):
            if item_code in last_positive_order_info:
                last_date_val, last_qty, description = last_positive_order_info[item_code]
                last_date_str = last_date_val.strftime("%Y-%m-%d")
            else:
                last_qty = 0
                last_date_str = "N/A"
                description = item_description_map.get(item_code, "")

            item_name = f"{item_code} - {description}" if description else item_code

            row_data = {
                "Object Id": f"OBJ{i}",
                "str ItemNo": item_code,
                "str ItemName": item_name,
                "str Unit": "pcs",
                "int GrossWeight": 0,
                "int LastRestockQty": last_qty,
                "Int CurrentQty": 0,
                "date LastRestockDate": last_date_str,
                "str Category": "Uncategorized",
                "list[] History{ Object Id Purchase }": "[]",
                "list[] Complimentary Items{ 1: ObjectId, 2: ObjectId }": "{}"
            }
            writer.writerow(row_data)

    # print(f"✅ Exported {len(all_items)} items to '{output_csv}'.")


# addZeros()
# handleMissingMonths()
# addToDB()


def create_synthetic_march_orders(existing_summary_path='item_summary_stats.json',
                                   output_csv='orders_march_2025.csv',
                                   default_qty_range=(0, 10)):
    import json
    import random

    # Load item list from your summaries
    with open(existing_summary_path, 'r') as f:
        summaries = json.load(f)

    # Take top 30 items with highest mean_qty
    top_items = sorted(summaries.items(), key=lambda x: x[1]['mean_qty'], reverse=True)[:30]

    # Generate fake March 2025 orders
    rows = []
    for item, stats in top_items:
        qty = round(random.uniform(*default_qty_range))  # Random quantity for now
        rows.append({
            'Item_Code': item,
            'Order_Qty': qty,
            'YearMonth': '2025-03-01'
        })

    # Convert and save
    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False)
    # print(f"✅ Created synthetic March 2025 orders at {output_csv} with {len(df)} items.")

# Run it
create_synthetic_march_orders()



