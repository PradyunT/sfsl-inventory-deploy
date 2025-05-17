## How to Deploy

Install all dependencies for `client/` and `server/`.

In two separate terminals:

```
cd client
npm install
```

```
cd server
npm install
```

Create `.env` files in both `client/` and `server/`

```
root/
  client/
    .env
  server/
    .env
```

`client/.env`

```
NODE_ENV=development
REACT_APP_SERVER_URL=http://localhost:8080
VITE_SERVER_URL=http://localhost:5173
```

`server/.env`

```
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb:<link-to-db>
SYSTEM=<your system [WINDOWS] or [MACOS]>
MONGO_DB=<name-of-db>
MONGO_COLLECTION=<name-of-collection>
```

### Running client and server

In two separate terminals:

```
cd client
npm run dev
```

```
cd server
npm start
```
---

## Why Linear Regression?

This MVP uses **linear regression** as the core forecasting model to predict monthly order quantities for different item categories. The primary goal was to build a **simple, interpretable, and fast prototype** that could reveal baseline trends and spark deeper exploration.

### Why Linear Regression?

- **Quick MVP testing:** Linear regression made it possible to quickly test whether order quantities exhibited any consistent trends over time.
- **Interpretability:** The simplicity of linear regression makes results easy to explain to both technical and non-technical audiences. It provides a direct understanding of whether quantities are trending up or down.
- **Benchmarking Tool:** Linear regression serves as a foundation to compare against more advanced forecasting techniques.
- **Speed and Low Overhead:** It enabled fast iteration and visualization without requiring complex tuning or infrastructure.

While linear regression doesn't capture all the intricacies of real-world demand (e.g., seasonality, promotions, or sudden shifts), it allowed for a **lightweight yet informative starting point** for demand modeling.

---

## Modeling Considerations

### How was performance evaluated?

At this MVP stage, **formal accuracy metrics (like RMSE or R²)** have not yet been calculated. Instead:
- Actual vs. predicted trends were plotted to visually assess model fit.
- Diagnostic plots (residuals vs. fitted, Q-Q plots, etc.) were used to validate assumptions.

Future iterations will include:
- `R²`, `MAE`, `RMSE` evaluations
- Residual analysis for bias, variance, and autocorrelation

---

### How was seasonality or volatility handled?

- As of now, **seasonality and high variance** are not explicitly modeled.
- Future plans include:
  - Incorporating **Prophet** (for trend + seasonality)
  - Exploring **ARIMA** for time-dependent autocorrelation

---

### Were regression assumptions checked?

Yes. Standard linear regression diagnostics were performed:
- **Residuals vs. predicted plots** to check for homoscedasticity
- **Histogram and Q-Q plots** to assess normality of errors

---

## Data Decisions

### What does each `Item_Code` represent?

`Item_Code` typically represents a unique SKU — including variations in brand, size, or packaging. For this MVP:
- Items were grouped by prefix (e.g., `MLK-001`, `MLK-500`) to generalize across similar products like “milk.”

### How was missing or zero data handled?

- Several months showed **zero sales** — potentially due to stockouts, data entry issues, or demand drops.
- To prevent misleading dips, **forward-filling** was applied (carrying over previous month’s quantity where zero was detected).

### Why are there sudden drops or spikes?

- Most likely caused by irregular ordering behavior, missing data, or external events.
- These patterns highlight the **need for more robust modeling** (e.g., anomaly detection or event-based forecasting).

---

## General Next Steps

- **System Functionality** | Automatic forecasting, user alerts, additional inventory filtering
- **Reports** | Additional informative reports, demographics, item combinations
- **User Feedback** | Pilot test and implement user feedback
- **Additional Features** | Consider integrations with SFSL systems like Barcode scanners

---

## Reflection

This MVP is intentionally simple. It’s not meant to be the final forecasting solution, but rather a **starting point** that demonstrates the potential in the data and establishes a clear path forward. Linear regression helped validate that signal exists, and future work will focus on refining the model and expanding its practical utility.

---
