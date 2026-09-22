import { useEffect, useRef, useState } from "react";
import type { PanelTheme } from "../data/panels";

interface Layer { id: number; theme: PanelTheme; visible: boolean }

/**
 * Renders a stack of full-bleed gradient backgrounds behind the page and crossfades
 * between them whenever the active theme changes, instead of switching instantly.
 */
export function ThemeStage({ theme }: { theme: PanelTheme }) {
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, theme, visible: true }]);
  const counter = useRef(1);

  useEffect(() => {
    setLayers((current) => {
      const top = current[current.length - 1];
      if (top && top.theme.from === theme.from && top.theme.to === theme.to) return current;
      return [...current, { id: counter.current++, theme, visible: false }];
    });
  }, [theme]);

  useEffect(() => {
    const hasHidden = layers.some((l) => !l.visible);
    if (!hasHidden) return;
    const raf = requestAnimationFrame(() => setLayers((cur) => cur.map((l) => ({ ...l, visible: true }))));
    return () => cancelAnimationFrame(raf);
  }, [layers]);

  useEffect(() => {
    if (layers.length <= 1) return;
    const timer = setTimeout(() => setLayers((cur) => cur.slice(-1)), 700);
    return () => clearTimeout(timer);
  }, [layers]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: layer.visible ? 1 : 0, background: `radial-gradient(120% 100% at 15% 0%, ${layer.theme.to}, ${layer.theme.from} 60%)` }}
        />
      ))}
    </div>
  );
}
