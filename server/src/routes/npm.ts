import { Router } from "express";
import { z } from "zod";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const npmRouter = Router();

const schema = z.object({ name: z.string().trim().regex(/^[\w.@/-]+$/, "Not a valid package name.").max(214) });

npmRouter.get("/package", async (req, res) => {
  const { name } = schema.parse(req.query);
  const key = `npm:${name}`;
  const [meta, downloads] = await cached(key, 15 * 60 * 1000, () =>
    Promise.all([
      upstream(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {}, "npm registry"),
      upstream(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(name)}`, {}, "npm downloads").catch(() => null),
    ]),
  );
  res.json({ meta, downloads });
});
