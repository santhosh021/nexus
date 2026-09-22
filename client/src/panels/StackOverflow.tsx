import { useState } from "react";
import { LuCheck, LuMessageSquare } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Pill, Skeleton } from "../components/PanelChrome";

const panel = findPanel("stackoverflow")!;
const theme = panel.theme;
const TAGS = ["typescript", "react", "angular", "node.js", "docker", "mysql"];

interface Question { question_id: number; title: string; link: string; tags: string[]; answer_count: number; is_answered: boolean; view_count: number }

export function StackOverflow() {
  const [tag, setTag] = useState("typescript");
  const { data, error, loading } = useFetch<{ items: Question[] }>(`/api/stackoverflow/questions?tag=${tag}`);

  return (
    <>
      <PanelHeader panel={panel} />
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button key={t} type="button" onClick={() => setTag(t)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={tag === t ? { background: theme.primary, color: theme.primaryFg } : { background: theme.surface, color: theme.muted, border: `1px solid ${theme.border}` }}>
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} theme={theme} className="h-16" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="Stack Exchange" />
      ) : data ? (
        <div className="space-y-2">
          {data.items.map((q) => (
            <a key={q.question_id} href={q.link} target="_blank" rel="noopener noreferrer">
              <Card theme={theme} className="flex items-center gap-4 py-3 transition-transform hover:-translate-y-0.5">
                <div className="w-14 shrink-0 text-center">
                  <p className="font-display text-lg" style={{ color: q.is_answered ? theme.primary : theme.muted }}>{q.answer_count}</p>
                  <p className="text-[10px]" style={{ color: theme.muted }}>answers</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{q.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{q.tags.slice(0, 4).map((t) => <Pill key={t} theme={theme}>{t}</Pill>)}</div>
                </div>
                {q.is_answered ? <LuCheck className="size-5 shrink-0" style={{ color: theme.primary }} /> : <LuMessageSquare className="size-5 shrink-0" style={{ color: theme.muted }} />}
              </Card>
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
