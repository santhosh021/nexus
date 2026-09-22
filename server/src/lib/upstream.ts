import { AppError } from "../errors.js";

const TIMEOUT_MS = 8000;

/** Fetches an external API with a timeout, turning a bad response into a clear AppError. */
export async function upstream(url: string, init: RequestInit = {}, label: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, headers: { "User-Agent": "nexus-portfolio-app", ...init.headers } });
    if (!res.ok) {
      if (res.status === 429) throw new AppError(429, "UPSTREAM_RATE_LIMITED", `${label} is rate-limiting us right now. Try again in a moment.`);
      throw new AppError(502, "UPSTREAM_ERROR", `${label} returned an error (${res.status}).`);
    }
    return await res.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if ((error as { name?: string }).name === "AbortError") throw new AppError(504, "UPSTREAM_TIMEOUT", `${label} took too long to respond.`);
    throw new AppError(502, "UPSTREAM_ERROR", `Could not reach ${label}.`);
  } finally {
    clearTimeout(timer);
  }
}
