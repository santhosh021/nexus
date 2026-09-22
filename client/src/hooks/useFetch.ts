import { useEffect, useState } from "react";

interface State<T> { data: T | null; error: string | null; loading: boolean }

/** Minimal data-fetching hook: loading/error/data for one URL, re-fetches when the URL changes. */
export function useFetch<T>(url: string | null): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: url !== null });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setState({ data: null, error: null, loading: true });
    fetch(url)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error?.message ?? `Request failed (${res.status}).`);
        return body as T;
      })
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((err: Error) => !cancelled && setState({ data: null, error: err.message || "Something went wrong.", loading: false }));
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
