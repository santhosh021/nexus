import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { findPanel, landingTheme, panels } from "./data/panels";
import { Landing } from "./components/Landing";
import { Sidebar } from "./components/Sidebar";
import { ThemeStage } from "./theme/ThemeStage";
import { PanelFade } from "./theme/PanelFade";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Weather } from "./panels/Weather";
import { Currency } from "./panels/Currency";
import { Crypto } from "./panels/Crypto";
import { HackerNews } from "./panels/HackerNews";
import { DevTo } from "./panels/DevTo";
import { GitHubPanel } from "./panels/GitHubPanel";
import { Npm } from "./panels/Npm";
import { StackOverflow } from "./panels/StackOverflow";
import { Security } from "./panels/Security";

const PANEL_COMPONENTS: Record<string, React.ComponentType> = {
  weather: Weather, currency: Currency, crypto: Crypto,
  hackernews: HackerNews, devto: DevTo, github: GitHubPanel, npm: Npm,
  stackoverflow: StackOverflow, security: Security,
};

function PanelRoute() {
  const { panelId } = useParams();
  const panel = findPanel(panelId);
  if (!panel) return <NotFound />;
  const Component = PANEL_COMPONENTS[panel.id];
  return (
    <div className="mx-auto max-w-5xl px-6 pb-10 md:px-10 md:pb-12">
      <ErrorBoundary resetKey={panel.id}>
        <Component />
      </ErrorBoundary>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center text-white">
      <p className="font-display text-4xl">404</p>
      <p className="mt-2 text-slate-400">That data source doesn't exist. Pick one from the sidebar.</p>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const panelId = location.pathname.split("/")[1] || undefined;
  const panel = findPanel(panelId);
  const theme = panel?.theme ?? landingTheme;
  return (
    <>
      <ThemeStage theme={theme} />
      <div className="min-h-screen md:flex">
        <Sidebar />
        <main id="main" className="min-w-0 flex-1">
          <PanelFade id={panelId ?? "home"}>
            <Routes>
              <Route index element={<Landing />} />
              <Route path=":panelId" element={<PanelRoute />} />
            </Routes>
          </PanelFade>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
