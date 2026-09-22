import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./errors.js";
import { cryptoRouter } from "./routes/crypto.js";
import { currencyRouter } from "./routes/currency.js";
import { devtoRouter } from "./routes/devto.js";
import { githubRouter } from "./routes/github.js";
import { hackerNewsRouter } from "./routes/hackernews.js";
import { npmRouter } from "./routes/npm.js";
import { securityRouter } from "./routes/security.js";
import { stackoverflowRouter } from "./routes/stackoverflow.js";
import { weatherRouter } from "./routes/weather.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  if (config.trustProxy > 0) app.set("trust proxy", config.trustProxy);

  // One shared limit is enough: nothing here is per-user, it just protects the upstream APIs.
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
  app.use("/api/weather", weatherRouter);
  app.use("/api/currency", currencyRouter);
  app.use("/api/crypto", cryptoRouter);
  app.use("/api/hackernews", hackerNewsRouter);
  app.use("/api/devto", devtoRouter);
  app.use("/api/github", githubRouter);
  app.use("/api/npm", npmRouter);
  app.use("/api/stackoverflow", stackoverflowRouter);
  app.use("/api/security", securityRouter);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);
  return app;
}
