import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";
import { config } from "../config.js";

export const githubRouter = Router();

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (config.keys.github) headers.Authorization = `Bearer ${config.keys.github}`;
  return headers;
}

const repoSchema = z.object({
  owner: z.string().trim().regex(/^[\w.-]+$/, "Not a valid GitHub owner name.").max(40),
  repo: z.string().trim().regex(/^[\w.-]+$/, "Not a valid GitHub repo name.").max(100),
});

githubRouter.get("/repo", async (req, res) => {
  const { owner, repo } = repoSchema.parse(req.query);
  const key = `gh:repo:${owner}/${repo}`;
  const [info, activity, contributors] = await cached(key, 10 * 60 * 1000, async () => {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: authHeaders() });
    if (repoRes.status === 404) throw new AppError(404, "REPO_NOT_FOUND", `No public repository found at ${owner}/${repo}.`);
    if (!repoRes.ok) throw new AppError(502, "UPSTREAM_ERROR", `GitHub returned an error (${repoRes.status}).`);
    const repoInfo = await repoRes.json();
    // Commit activity can return 202 while GitHub computes it the first time; retry once, briefly.
    let weeks: unknown = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      const res2 = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, { headers: authHeaders() });
      if (res2.status === 200) { weeks = await res2.json(); break; }
      await new Promise((r) => setTimeout(r, 1200));
    }
    const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=6`, { headers: authHeaders() });
    const topContributors = contribRes.ok ? await contribRes.json() : [];
    return [repoInfo, weeks, topContributors] as const;
  });
  res.json({ repo: info, weeklyCommits: activity, contributors });
});
