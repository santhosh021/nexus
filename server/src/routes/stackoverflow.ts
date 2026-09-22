import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";
import { config } from "../config.js";

export const stackoverflowRouter = Router();

const TAGS = ["typescript", "react", "angular", "node.js", "docker", "mysql"];

const schema = z.object({ tag: z.enum(TAGS as [string, ...string[]]).default("typescript") });

// Stack Exchange responses are gzip-encoded on the wire; fetch() decodes that automatically.
stackoverflowRouter.get("/questions", async (req, res) => {
  const { tag } = schema.parse({ tag: req.query.tag ?? "typescript" });
  const data = await cached(`so:${tag}`, 10 * 60 * 1000, () => {
    const url = new URL("https://api.stackexchange.com/2.3/questions");
    url.searchParams.set("order", "desc");
    url.searchParams.set("sort", "activity");
    url.searchParams.set("tagged", tag);
    url.searchParams.set("site", "stackoverflow");
    url.searchParams.set("pagesize", "20");
    if (config.keys.stackApps) url.searchParams.set("key", config.keys.stackApps);
    return upstream(url.toString(), {}, "Stack Exchange");
  });
  const body = data as { error_message?: string };
  if (body?.error_message) throw new AppError(502, "UPSTREAM_ERROR", body.error_message);
  res.json({ ...(data as object), tags: TAGS });
});
