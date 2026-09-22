import { Router } from "express";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const hackerNewsRouter = Router();
const BASE = "https://hacker-news.firebaseio.com/v0";
const STORY_COUNT = 20;

interface HnItem { id: number; title?: string; url?: string; score?: number; by?: string; time?: number; descendants?: number; type?: string }

hackerNewsRouter.get("/top", async (_req, res) => {
  const stories = await cached("hn:top", 5 * 60 * 1000, async () => {
    const ids = (await upstream(`${BASE}/topstories.json`, {}, "Hacker News")) as number[];
    const top = ids.slice(0, STORY_COUNT);
    const items = await Promise.all(top.map((id) => upstream(`${BASE}/item/${id}.json`, {}, "Hacker News") as Promise<HnItem>));
    return items.filter((item) => item && item.title);
  });
  res.json({ items: stories });
});
