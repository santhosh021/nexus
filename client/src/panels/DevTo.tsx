import { useState } from "react";
import { LuHeart, LuMessageCircle } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("devto")!;
const theme = panel.theme;
const TAGS = ["javascript", "typescript", "react", "webdev", "docker", "career"];

interface Article {
  id: number; title: string; url: string; description: string; positive_reactions_count: number;
  comments_count: number; cover_image: string | null; user: { name: string }; tag_list: string[];
}

export function DevTo() {
  const [tag, setTag] = useState<string | undefined>(undefined);
  const { data, error, loading } = useFetch<Article[]>(`/api/devto${tag ? `?tag=${tag}` : ""}`);

  return (
    <>
      <PanelHeader panel={panel} />
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ id: undefined, label: "All" }, ...TAGS.map((t) => ({ id: t, label: t }))].map((t) => (
          <button key={t.label} type="button" onClick={() => setTag(t.id)}
            className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
            style={tag === t.id ? { background: theme.primary, color: theme.primaryFg } : { background: theme.surface, color: theme.muted, border: `1px solid ${theme.border}` }}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} theme={theme} className="h-52" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="DEV Community" />
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
              <Card theme={theme} className="flex h-full flex-col overflow-hidden !p-0 transition-transform hover:-translate-y-0.5">
                {a.cover_image && <img src={a.cover_image} alt="" className="h-28 w-full object-cover" loading="lazy" />}
                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-2 font-medium">{a.title}</p>
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>by {a.user.name}</p>
                  <div className="mt-auto flex items-center gap-4 pt-3 text-xs" style={{ color: theme.muted }}>
                    <span className="flex items-center gap-1"><LuHeart className="size-3.5" />{a.positive_reactions_count}</span>
                    <span className="flex items-center gap-1"><LuMessageCircle className="size-3.5" />{a.comments_count}</span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
