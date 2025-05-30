import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoConnect from "config/db";
import rootRouter from "routes";
import { requestLogger } from "utils/middleware";
import reportsRoutes from "./routes/reports.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import neighborRouter from "./routes/neighbor.route.js";
import purchaseRouter from "./routes/purchase.route.js";

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
const allowedOrigins = [process.env.CLIENT_URL];

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestLogger);

// set up api route
app.use("/api", rootRouter);
app.use("/api/reports", reportsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/neighbors", neighborRouter);
app.use("/api/purchase", purchaseRouter);

mongoConnect().then(async () => {
  app.listen(port, () => {
    console.log(`node env: ${process.env.NODE_ENV}`);
    console.log(`server listening on port ${port}`);
  });
});
