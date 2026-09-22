import { useState, type FormEvent } from "react";
import { LuSearch } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Pill, Skeleton } from "../components/PanelChrome";

const panel = findPanel("security")!;
const theme = panel.theme;

interface Cve {
  cve: {
    id: string; published: string;
    descriptions: Array<{ lang: string; value: string }>;
    metrics?: { cvssMetricV31?: Array<{ cvssData: { baseScore: number; baseSeverity: string } }> };
  };
}

const severityColor: Record<string, string> = { CRITICAL: "#f87171", HIGH: "#fb923c", MEDIUM: "#fbbf24", LOW: "#4ade80" };

export function Security() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const { data, error, loading } = useFetch<{ vulnerabilities: Cve[] }>(`/api/security/cves${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`);

  const onSubmit = (e: FormEvent) => { e.preventDefault(); setKeyword(input.trim() || undefined); };

  return (
    <>
      <PanelHeader panel={panel} />
      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" style={{ color: theme.muted }} />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by keyword, e.g. nginx (optional)"
            className="h-11 w-full rounded-xl border pl-10 pr-3 text-sm" style={{ background: theme.surface, borderColor: theme.border, color: theme.text }} />
        </div>
        <button type="submit" className="rounded-xl px-5 text-sm font-semibold" style={{ background: theme.primary, color: theme.primaryFg }}>Search</button>
      </form>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} theme={theme} className="h-20" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="the NVD" />
      ) : data ? (
        <div className="space-y-3">
          {data.vulnerabilities.map(({ cve }) => {
            const metric = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
            const desc = cve.descriptions.find((d) => d.lang === "en")?.value ?? "No description available.";
            return (
              <Card key={cve.id} theme={theme}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono font-medium">{cve.id}</p>
                  {metric && (
                    <Pill theme={theme}><span style={{ color: severityColor[metric.baseSeverity] ?? theme.text }}>{metric.baseSeverity}</span> · {metric.baseScore}</Pill>
                  )}
                </div>
                <p className="mt-2 line-clamp-3 text-sm" style={{ color: theme.muted }}>{desc}</p>
                <p className="mt-2 text-xs" style={{ color: theme.muted }}>Published {new Date(cve.published).toLocaleDateString()}</p>
              </Card>
            );
          })}
          {data.vulnerabilities.length === 0 && <p className="text-sm" style={{ color: theme.muted }}>No results for that keyword.</p>}
        </div>
      ) : null}
    </>
  );
}
