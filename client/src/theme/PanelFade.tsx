import { useEffect, useState, type ReactNode } from "react";

/** Fades content out, swaps it, then fades the new content in — used when the route changes. */
export function PanelFade({ id, children }: { id: string; children: ReactNode }) {
  const [shown, setShown] = useState<{ id: string; node: ReactNode }>({ id, node: children });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (id === shown.id) { setShown({ id, node: children }); return; }
    setVisible(false);
    const timer = setTimeout(() => { setShown({ id, node: children }); setVisible(true); }, 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="transition-opacity duration-200 ease-in-out" style={{ opacity: visible ? 1 : 0 }}>
      {shown.node}
    </div>
  );
}
