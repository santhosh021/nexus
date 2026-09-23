import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import { panels } from "../data/panels";

function Links({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Data sources" className="flex flex-col gap-1">
      {panels.map((p) => {
        const Icon = p.icon;
        return (
          <NavLink
            key={p.id}
            to={`/${p.id}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {p.name}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Panel headers stick just below this bar on mobile; measure it so the offset is always exact.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setHeight = () => document.documentElement.style.setProperty("--nexus-topbar-h", `${el.offsetHeight}px`);
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/30 px-4 py-6 backdrop-blur-md md:sticky md:top-0 md:flex md:h-screen">
        <NavLink to="/" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-lg bg-white/10 font-display text-lg text-white">N</span>
          <span className="font-display text-xl text-white">Nexus</span>
        </NavLink>
        <div className="no-scrollbar flex-1 overflow-y-auto"><Links /></div>
      </div>

      <div ref={barRef} className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md md:hidden">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-white/10 font-display text-white">N</span>
          <span className="font-display text-lg text-white">Nexus</span>
        </NavLink>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} className="rounded-md p-2 text-white">
          {open ? <LuX className="size-6" /> : <LuMenu className="size-6" />}
        </button>
      </div>
      {open && (
        <>
          {/* Click-outside-to-close backdrop, and it stops the dropdown from sitting behind page content. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 z-30 bg-black/50 md:hidden"
            style={{ top: "var(--nexus-topbar-h, 0px)" }}
          />
          {/*
            Fixed to the viewport (not the document), positioned right below the sticky top bar,
            so it always opens on screen no matter how far down the page you've scrolled.
          */}
          <div
            id="mobile-nav"
            className="fixed inset-x-0 z-[35] max-h-[70vh] overflow-y-auto border-b border-white/10 bg-[#0b0e14]/95 px-4 py-3 backdrop-blur-md md:hidden"
            style={{ top: "var(--nexus-topbar-h, 0px)" }}
          >
            <Links onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
