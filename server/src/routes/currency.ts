import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const currencyRouter = Router();

const SYMBOLS = "USD,EUR,GBP,JPY,AUD,CAD,SGD,AED";

currencyRouter.get("/latest", async (req, res) => {
  const base = z.string().length(3).default("INR").parse(req.query.base ?? "INR").toUpperCase();
  const data = await cached(`currency:latest:${base}`, 60 * 60 * 1000, () =>
    upstream(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${SYMBOLS}`, {}, "Frankfurter"),
  );
  res.json(data);
});

const historySchema = z.object({
  base: z.string().length(3).default("USD"),
  target: z.string().length(3).default("INR"),
});

// 90 days of history for a simple line chart.
currencyRouter.get("/history", async (req, res) => {
  const { base, target } = historySchema.parse({ base: req.query.base ?? "USD", target: req.query.target ?? "INR" });
  const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const data = await cached(`currency:history:${base}:${target}`, 6 * 60 * 60 * 1000, () =>
    upstream(`https://api.frankfurter.dev/v1/${start}..?base=${base.toUpperCase()}&symbols=${target.toUpperCase()}`, {}, "Frankfurter"),
  );
  if (!data || typeof data !== "object" || !("rates" in data)) throw new AppError(502, "UPSTREAM_ERROR", "Frankfurter returned unexpected data.");
  res.json(data);
});
