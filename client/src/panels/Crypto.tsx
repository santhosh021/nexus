import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("crypto")!;
const theme = panel.theme;

interface Coin {
  id: string; name: string; symbol: string; image: string; current_price: number;
  price_change_percentage_24h: number; sparkline_in_7d: { price: number[] };
}

const money = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 4 : 2 });

export function Crypto() {
  const { data, error, loading } = useFetch<Coin[]>("/api/crypto/markets");

  return (
    <>
      <PanelHeader panel={panel} />
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} theme={theme} className="h-16" />)}</div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="CoinGecko" />
      ) : data ? (
        <div className="divide-y overflow-hidden rounded-2xl border" style={{ borderColor: theme.border, background: theme.surface }}>
          {data.map((coin) => {
            const up = coin.price_change_percentage_24h >= 0;
            const points = coin.sparkline_in_7d?.price?.filter((_, i) => i % 4 === 0).map((p, i) => ({ i, p })) ?? [];
            return (
              <div key={coin.id} className="flex items-center gap-4 px-5 py-4" style={{ borderColor: theme.border }}>
                <img src={coin.image} alt="" className="size-8 shrink-0 rounded-full" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{coin.name} <span className="uppercase" style={{ color: theme.muted }}>{coin.symbol}</span></p>
                </div>
                <div className="hidden h-10 w-28 shrink-0 sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points}><Line type="monotone" dataKey="p" stroke={up ? "#34d399" : "#fb7185"} strokeWidth={1.5} dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="font-medium">{money(coin.current_price)}</p>
                  <p className="flex items-center justify-end gap-1 text-xs" style={{ color: up ? "#34d399" : "#fb7185" }}>
                    {up ? <LuArrowUp className="size-3" /> : <LuArrowDown className="size-3" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
