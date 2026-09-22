import { Router } from "express";
import { z } from "zod";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";
import { config } from "../config.js";

export const securityRouter = Router();

const schema = z.object({ keyword: z.string().trim().max(60).optional() });

securityRouter.get("/cves", async (req, res) => {
  const { keyword } = schema.parse(req.query);
  const key = `cve:${keyword ?? "recent"}`;
  const data = await cached(key, 15 * 60 * 1000, () => {
    const url = new URL("https://services.nvd.nist.gov/rest/json/cves/2.0");
    url.searchParams.set("resultsPerPage", "20");
    if (keyword) url.searchParams.set("keywordSearch", keyword);
    const headers: Record<string, string> = {};
    if (config.keys.nvd) headers.apiKey = config.keys.nvd;
    return upstream(url.toString(), { headers }, "the NVD");
  });
  res.json(data);
});
