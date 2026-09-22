import { useMemo, useState } from "react";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("currency")!;
const theme = panel.theme;
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED", "INR"];

interface LatestResponse { base: string; date: string; rates: Record<string, number> }
interface HistoryResponse { rates: Record<string, Record<string, number>> }

export function Currency() {
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("INR");
  const [amount, setAmount] = useState(100);

  const latest = useFetch<LatestResponse>(`/api/currency/latest?base=${base}`);
  const history = useFetch<HistoryResponse>(`/api/currency/history?base=${base}&target=${target}`);

  const rate = base === target ? 1 : latest.data?.rates?.[target];
  const chart = history.data ? Object.entries(history.data.rates).map(([date, r]) => ({ date, rate: r[target] ?? 0 })) : [];

  // How much the rate has moved from the first day in the 90-day window to today.
  const trend = useMemo(() => {
    if (chart.length < 2) return null;
    const first = chart[0]!.rate, last = chart[chart.length - 1]!.rate;
    if (!first) return null;
    return { pct: ((last - first) / first) * 100, up: last >= first };
  }, [chart]);

  const select = (value: string, onChange: (v: string) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl border px-3 text-sm"
      style={{ background: theme.from, borderColor: theme.border, color: theme.text }}>
      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  return (
    <>
      <PanelHeader panel={panel} />
      <div className="space-y-4">
        <Card theme={theme}>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs" style={{ color: theme.muted }}>
              Amount
              <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="h-11 w-32 rounded-xl border px-3 text-sm" style={{ background: theme.from, borderColor: theme.border, color: theme.text }} />
            </label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: theme.muted }}>From{select(base, setBase)}</label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: theme.muted }}>To{select(target, setTarget)}</label>
          </div>
          <div className="mt-6">
            {latest.loading ? <Skeleton theme={theme} className="h-12 w-64" /> : latest.error ? (
              <ErrorBox theme={theme} message={latest.error} source="Frankfurter" />
            ) : rate !== undefined ? (
              <p className="font-display text-3xl">
                {amount.toLocaleString()} {base} = <span style={{ color: theme.primary }}>{(amount * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} {target}</span>
              </p>
            ) : null}
          </div>
          {!history.loading && !history.error && chart.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs" style={{ color: theme.muted }}>{base} → {target}, last 90 days</p>
                {trend && (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: trend.up ? "#34d399" : "#fb7185" }}>
                    {trend.up ? <LuArrowUp className="size-3" /> : <LuArrowDown className="size-3" />}
                    {Math.abs(trend.pct).toFixed(2)}% over 90 days
                  </span>
                )}
              </div>
              <div className="mt-2 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart}>
                    <XAxis dataKey="date" hide /><YAxis hide domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text }} />
                    <Line type="monotone" dataKey="rate" stroke={theme.primary} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        <Card theme={theme}>
          <p className="mb-3 text-sm font-medium" style={{ color: theme.muted }}>1 {base} equals</p>
          {latest.loading ? (
            <Skeleton theme={theme} className="h-24" />
          ) : latest.data ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(latest.data.rates).map(([code, value]) => (
                <button key={code} type="button" onClick={() => setTarget(code)}
                  className="rounded-xl border p-3 text-left transition-colors"
                  style={{ borderColor: code === target ? theme.primary : theme.border, background: theme.from }}>
                  <p className="text-xs" style={{ color: theme.muted }}>{code}</p>
                  <p className="font-medium">{value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                </button>
              ))}
            </div>
          ) : null}
          {latest.data && <p className="mt-3 text-xs" style={{ color: theme.muted }}>Rates as of {latest.data.date}</p>}
        </Card>
      </div>
    </>
  );
}
