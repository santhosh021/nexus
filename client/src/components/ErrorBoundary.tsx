import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; resetKey: string }
interface State { error: Error | null }

/**
 * Catches a crash in one panel so the sidebar and the rest of the app stay usable.
 * Without this, any uncaught error inside a panel would blank the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("Panel crashed:", error, info.componentStack);
  }
  componentDidUpdate(prev: Props) {
    // Clear the error automatically when the visitor navigates to a different panel.
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-white">
          <p className="font-display text-3xl">Something went wrong on this page</p>
          <p className="mt-2 text-slate-400">{this.state.error.message || "An unexpected error occurred."}</p>
          <p className="mt-1 text-sm text-slate-500">Pick another data source from the sidebar, or reload.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
