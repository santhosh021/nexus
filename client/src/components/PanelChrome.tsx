import type { ReactNode } from "react";
import type { PanelDef } from "../data/panels";

/**
 * Sticks to the top of the viewport as the page scrolls, so the icon and description
 * stay visible while the panel's content scrolls underneath. On mobile it sticks just
 * below the app's top bar, using the height Sidebar measures into --nexus-topbar-h.
 */
export function PanelHeader({ panel, right }: { panel: PanelDef; right?: ReactNode }) {
  const Icon = panel.icon;
  return (
    <header
      className="sticky z-20 -mx-6 mb-6 flex flex-wrap items-start justify-between gap-4 border-b px-6 pt-6 pb-5 md:-mx-10 md:px-10 md:pt-8"
      style={{ top: "var(--nexus-topbar-h, 0px)", background: panel.theme.surface, borderColor: panel.theme.border }}
    >
      <div className="flex items-center gap-4">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-2xl"
          style={{ background: panel.theme.primary, color: panel.theme.primaryFg }}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl" style={{ color: panel.theme.text }}>{panel.name}</h1>
          <p style={{ color: panel.theme.muted }}>{panel.description}</p>
        </div>
      </div>
      {right}
    </header>
  );
}

export function Card({ theme, className, children }: { theme: PanelDef["theme"]; className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className ?? ""}`}
      style={{ background: theme.surface, borderColor: theme.border, color: theme.text }}
    >
      {children}
    </div>
  );
}

export function Skeleton({ theme, className }: { theme: PanelDef["theme"]; className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-lg ${className ?? "h-24"}`} style={{ background: theme.border }} />;
}

export function ErrorBox({ theme, message, source }: { theme: PanelDef["theme"]; message: string; source: string }) {
  return (
    <div role="alert" className="rounded-2xl border p-6 text-center" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
      <p className="font-medium">Could not load data from {source}</p>
      <p className="mt-1 text-sm" style={{ color: theme.muted }}>{message}</p>
    </div>
  );
}

export function Pill({ theme, children }: { theme: PanelDef["theme"]; children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: theme.border, color: theme.text }}>
      {children}
    </span>
  );
}
