import { LuArrowUp, LuMessageCircle } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("hackernews")!;
const theme = panel.theme;

interface HnItem { id: number; title: string; url?: string; score: number; by: string; descendants?: number; time: number }

const hostOf = (url?: string) => { try { return url ? new URL(url).host.replace(/^www\./, "") : "news.ycombinator.com"; } catch { return "news.ycombinator.com"; } };

export function HackerNews() {
  const { data, error, loading } = useFetch<{ items: HnItem[] }>("/api/hackernews/top");

  return (
    <>
      <PanelHeader panel={panel} />
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} theme={theme} className="h-16" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="Hacker News" />
      ) : data ? (
        <ol className="space-y-2">
          {data.items.map((item, i) => (
            <li key={item.id}>
              <Card theme={theme} className="flex items-center gap-4 py-3">
                <span className="w-6 shrink-0 text-center text-sm" style={{ color: theme.muted }}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <a href={item.url ?? `https://news.ycombinator.com/item?id=${item.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    {item.title}
                  </a>
                  <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>{hostOf(item.url)} · by {item.by}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm" style={{ color: theme.primary }}>
                  <span className="flex items-center gap-1"><LuArrowUp className="size-4" />{item.score}</span>
                  <span className="flex items-center gap-1" style={{ color: theme.muted }}><LuMessageCircle className="size-4" />{item.descendants ?? 0}</span>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}
