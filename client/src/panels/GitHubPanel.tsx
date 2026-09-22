import { useState, type FormEvent } from "react";
import { LuSearch, LuStar, LuGitFork, LuCircleAlert, LuGitBranch, LuCalendar, LuScale, LuExternalLink } from "react-icons/lu";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Pill, Skeleton } from "../components/PanelChrome";

const panel = findPanel("github")!;
const theme = panel.theme;

interface RepoResponse {
  repo: {
    full_name: string; description: string | null; stargazers_count: number; forks_count: number;
    open_issues_count: number; language: string | null; html_url: string; homepage: string | null;
    default_branch: string; license: { name: string } | null; topics: string[];
    created_at: string; pushed_at: string;
  };
  weeklyCommits: Array<{ total: number; week: number }>;
  contributors: Array<{ login: string; avatar_url: string; html_url: string; contributions: number }>;
}

const dateOnly = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export function GitHubPanel() {
  const [query, setQuery] = useState({ owner: "facebook", repo: "react" });
  const [input, setInput] = useState("facebook/react");
  const { data, error, loading } = useFetch<RepoResponse>(`/api/github/repo?owner=${query.owner}&repo=${query.repo}`);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const [owner, repo] = input.split("/").map((s) => s.trim());
    if (owner && repo) setQuery({ owner, repo });
  };

  const chartData = data?.weeklyCommits?.slice(-26).map((w) => ({ week: new Date(w.week * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }), commits: w.total })) ?? [];

  return (
    <>
      <PanelHeader panel={panel} />
      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" style={{ color: theme.muted }} />
          <input
            value={input} onChange={(e) => setInput(e.target.value)} placeholder="owner/repo, e.g. facebook/react"
            className="h-11 w-full rounded-xl border pl-10 pr-3 text-sm"
            style={{ background: theme.surface, borderColor: theme.border, color: theme.text }}
          />
        </div>
        <button type="submit" className="rounded-xl px-5 text-sm font-semibold" style={{ background: theme.primary, color: theme.primaryFg }}>Look up</button>
      </form>

      {loading ? (
        <Skeleton theme={theme} className="h-64" />
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="GitHub" />
      ) : data ? (
        <div className="space-y-4">
          <Card theme={theme}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <a href={data.repo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-display text-xl hover:underline" style={{ color: theme.text }}>
                  {data.repo.full_name}<LuExternalLink className="size-4" style={{ color: theme.muted }} />
                </a>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>{data.repo.description ?? "No description."}</p>
              </div>
              {data.repo.language && <Pill theme={theme}>{data.repo.language}</Pill>}
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm" style={{ color: theme.text }}>
              <span className="flex items-center gap-1.5"><LuStar className="size-4" style={{ color: theme.primary }} />{data.repo.stargazers_count.toLocaleString()} stars</span>
              <span className="flex items-center gap-1.5"><LuGitFork className="size-4" style={{ color: theme.primary }} />{data.repo.forks_count.toLocaleString()} forks</span>
              <span className="flex items-center gap-1.5"><LuCircleAlert className="size-4" style={{ color: theme.primary }} />{data.repo.open_issues_count.toLocaleString()} open issues</span>
              <span className="flex items-center gap-1.5"><LuGitBranch className="size-4" style={{ color: theme.primary }} />{data.repo.default_branch}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs" style={{ color: theme.muted }}>
              <span className="flex items-center gap-1.5"><LuCalendar className="size-3.5" />Created {dateOnly(data.repo.created_at)}</span>
              <span className="flex items-center gap-1.5"><LuCalendar className="size-3.5" />Last push {dateOnly(data.repo.pushed_at)}</span>
              {data.repo.license && <span className="flex items-center gap-1.5"><LuScale className="size-3.5" />{data.repo.license.name}</span>}
            </div>

            {data.repo.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">{data.repo.topics.slice(0, 10).map((t) => <Pill key={t} theme={theme}>{t}</Pill>)}</div>
            )}

            {chartData.length > 0 && (
              <div className="mt-6 h-40">
                <p className="mb-2 text-xs" style={{ color: theme.muted }}>Commits per week, last 26 weeks</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="week" hide />
                    <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text }} />
                    <Bar dataKey="commits" fill={theme.primary} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {data.contributors.length > 0 && (
            <Card theme={theme}>
              <p className="mb-3 text-sm font-medium" style={{ color: theme.muted }}>Top contributors</p>
              <div className="flex flex-wrap gap-3">
                {data.contributors.map((c) => (
                  <a key={c.login} href={c.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: theme.border }}>
                    <img src={c.avatar_url} alt="" className="size-7 rounded-full" loading="lazy" />
                    <span className="text-sm">{c.login}</span>
                    <span className="text-xs" style={{ color: theme.muted }}>{c.contributions}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </>
  );
}
