import json
from datetime import datetime

from generate_summary_stats import predict_next_month_quantities

try:
    # 👇 Automatically use the current month
    current_month = datetime.today().strftime('%Y-%m')

    predictions = predict_next_month_quantities(forecast_month=current_month)

    result = [{"item_code": item, "predicted_qty": qty} for item, qty in predictions[:100]]

    # ✅ ONLY THIS should be printed to stdout
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
