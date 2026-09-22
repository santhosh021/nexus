import { useState, type FormEvent } from "react";
import { LuSearch, LuDownload, LuScale, LuUsers, LuExternalLink, LuHistory } from "react-icons/lu";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Pill, Skeleton } from "../components/PanelChrome";

const panel = findPanel("npm")!;
const theme = panel.theme;

interface NpmResponse {
  meta: {
    name: string; description?: string; "dist-tags": { latest: string }; license?: string;
    homepage?: string; keywords?: string[]; maintainers?: Array<{ name: string }>;
    versions?: Record<string, unknown>; time?: Record<string, string>;
    repository?: { url?: string };
  };
  downloads: { downloads: Array<{ day: string; downloads: number }> } | null;
}

const dateOnly = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Unknown");
const repoUrl = (url?: string) => url?.replace(/^git\+/, "").replace(/\.git$/, "").replace(/^git:\/\//, "https://");

export function Npm() {
  const [name, setName] = useState("react");
  const [input, setInput] = useState("react");
  const { data, error, loading } = useFetch<NpmResponse>(`/api/npm/package?name=${encodeURIComponent(name)}`);

  const onSubmit = (e: FormEvent) => { e.preventDefault(); if (input.trim()) setName(input.trim()); };
  const total = data?.downloads?.downloads.reduce((sum, d) => sum + d.downloads, 0) ?? 0;
  const chart = data?.downloads?.downloads.filter((_, i) => i % 2 === 0).map((d) => ({ day: d.day, downloads: d.downloads })) ?? [];
  const versionCount = data?.meta.versions ? Object.keys(data.meta.versions).length : undefined;
  const latestVersion = data?.meta["dist-tags"]?.latest;
  const publishedAt = latestVersion ? data?.meta.time?.[latestVersion] : undefined;

  return (
    <>
      <PanelHeader panel={panel} />
      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" style={{ color: theme.muted }} />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="package name, e.g. express"
            className="h-11 w-full rounded-xl border pl-10 pr-3 text-sm" style={{ background: theme.surface, borderColor: theme.border, color: theme.text }} />
        </div>
        <button type="submit" className="rounded-xl px-5 text-sm font-semibold" style={{ background: theme.primary, color: theme.primaryFg }}>Look up</button>
      </form>

      {loading ? <Skeleton theme={theme} className="h-64" /> : error ? <ErrorBox theme={theme} message={error} source="npm" /> : data ? (
        <div className="space-y-4">
          <Card theme={theme}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{data.meta.name} <span className="text-sm font-normal" style={{ color: theme.muted }}>v{latestVersion}</span></p>
                <p className="mt-1 max-w-xl text-sm" style={{ color: theme.muted }}>{data.meta.description ?? "No description."}</p>
              </div>
              {data.meta.license && <Pill theme={theme}>{data.meta.license}</Pill>}
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-xs" style={{ color: theme.muted }}>
              {publishedAt && <span className="flex items-center gap-1.5"><LuHistory className="size-3.5" />Published {dateOnly(publishedAt)}</span>}
              {versionCount !== undefined && <span className="flex items-center gap-1.5"><LuScale className="size-3.5" />{versionCount} versions on npm</span>}
              {data.meta.maintainers && <span className="flex items-center gap-1.5"><LuUsers className="size-3.5" />{data.meta.maintainers.length} maintainers</span>}
              {(data.meta.homepage || data.meta.repository?.url) && (
                <a href={data.meta.homepage ?? repoUrl(data.meta.repository?.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: theme.primary }}>
                  <LuExternalLink className="size-3.5" />Homepage
                </a>
              )}
            </div>

            {data.meta.keywords && data.meta.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">{data.meta.keywords.slice(0, 10).map((k) => <Pill key={k} theme={theme}>{k}</Pill>)}</div>
            )}

            {data.downloads ? (
              <>
                <p className="mt-5 flex items-center gap-2 text-2xl font-semibold" style={{ color: theme.primary }}>
                  <LuDownload className="size-5" />{total.toLocaleString()} <span className="text-sm font-normal" style={{ color: theme.muted }}>downloads last month</span>
                </p>
                <div className="mt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart}>
                      <defs><linearGradient id="npmFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.primary} stopOpacity={0.5} /><stop offset="100%" stopColor={theme.primary} stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="day" hide />
                      <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text }} />
                      <Area type="monotone" dataKey="downloads" stroke={theme.primary} fill="url(#npmFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : <p className="mt-5 text-sm" style={{ color: theme.muted }}>Download counts were not available for this package right now.</p>}
          </Card>

          {data.meta.maintainers && data.meta.maintainers.length > 0 && (
            <Card theme={theme}>
              <p className="mb-3 text-sm font-medium" style={{ color: theme.muted }}>Maintainers</p>
              <div className="flex flex-wrap gap-2">
                {data.meta.maintainers.map((m) => <Pill key={m.name} theme={theme}>{m.name}</Pill>)}
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </>
  );
}
