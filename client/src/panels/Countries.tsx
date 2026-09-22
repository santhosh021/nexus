import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("countries")!;
const theme = panel.theme;

interface Country {
  name: { common: string }; flags: { svg: string }; population: number; region: string; capital?: string[];
  currencies?: Record<string, { name: string }>; languages?: Record<string, string>;
}

export function Countries() {
  const { data, error, loading } = useFetch<Country[]>("/api/countries");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    const list = term ? data.filter((c) => c.name.common.toLowerCase().includes(term)) : data;
    return [...list].sort((a, b) => a.name.common.localeCompare(b.name.common)).slice(0, 60);
  }, [data, search]);

  return (
    <>
      <PanelHeader panel={panel} />
      <div className="relative mb-6">
        <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" style={{ color: theme.muted }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search countries"
          className="h-11 w-full rounded-xl border pl-10 pr-3 text-sm" style={{ background: theme.surface, borderColor: theme.border, color: theme.text }} />
      </div>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 9 }, (_, i) => <Skeleton key={i} theme={theme} className="h-28" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="REST Countries" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.name.common} theme={theme} className="flex items-start gap-3">
              <img src={c.flags.svg} alt="" className="h-10 w-14 shrink-0 rounded object-cover" loading="lazy" />
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name.common}</p>
                <p className="text-xs" style={{ color: theme.muted }}>{c.capital?.[0] ?? "No capital listed"} · {c.region}</p>
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>{c.population.toLocaleString()} people</p>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && <p className="text-sm" style={{ color: theme.muted }}>No countries match "{search}".</p>}
    </>
  );
}
