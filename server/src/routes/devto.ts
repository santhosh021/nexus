import { Router } from "express";
import { z } from "zod";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const devtoRouter = Router();

const querySchema = z.object({ tag: z.string().trim().max(30).optional() });

devtoRouter.get("/", async (req, res) => {
  const { tag } = querySchema.parse(req.query);
  const key = `devto:${tag ?? "all"}`;
  const data = await cached(key, 15 * 60 * 1000, () => {
    const url = new URL("https://dev.to/api/articles");
    url.searchParams.set("top", "7");
    url.searchParams.set("per_page", "18");
    if (tag) url.searchParams.set("tag", tag);
    return upstream(url.toString(), {}, "DEV Community");
  });
  res.json(data);
});
