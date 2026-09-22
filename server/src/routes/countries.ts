import { Router } from "express";
import { z } from "zod";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const countriesRouter = Router();

const FIELDS = "name,flags,population,region,subregion,capital,currencies,languages,area,timezones";

countriesRouter.get("/", async (_req, res) => {
  const data = await cached("countries:all", 24 * 60 * 60 * 1000, () =>
    upstream(`https://restcountries.com/v3.1/all?fields=${FIELDS}`, {}, "REST Countries"),
  );
  res.json(data);
});

const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });

countriesRouter.get("/search", async (req, res) => {
  const { name } = nameSchema.parse(req.query);
  const data = await cached(`countries:search:${name.toLowerCase()}`, 60 * 60 * 1000, () =>
    upstream(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=${FIELDS}`, {}, "REST Countries"),
  );
  res.json(data);
});
