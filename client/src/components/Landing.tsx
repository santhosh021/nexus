import { Link } from "react-router-dom";
import { panels } from "../data/panels";

export function Landing() {
  return (
    <div className="panel-enter mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
      <p className="font-display text-sm tracking-[0.3em] text-slate-400 uppercase">Nexus</p>
      <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">Where public data lives.</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-400">
        Ten free public APIs, each with its own view built to fit its data. Pick one below — the whole page changes with it.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.id}
              to={`/${p.id}`}
              className="group rounded-2xl border p-5 transition-transform hover:-translate-y-0.5"
              style={{ background: p.theme.surface, borderColor: p.theme.border }}
            >
              <span className="grid size-11 place-items-center rounded-xl" style={{ background: p.theme.primary, color: p.theme.primaryFg }}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-lg" style={{ color: p.theme.text }}>{p.name}</h2>
              <p className="mt-1 text-sm" style={{ color: p.theme.muted }}>{p.tagline}</p>
              <p className="mt-3 text-xs" style={{ color: p.theme.muted }}>via {p.api}</p>
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-slate-500">
        Built by Santhosh. Data from ten public APIs, refreshed live. No accounts, no tracking.
      </footer>
    </div>
  );
}
