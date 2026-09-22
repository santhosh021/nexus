import type { IconType } from "react-icons";
import {
  LuCloudSun, LuCoins, LuBitcoin, LuFlame, LuNewspaper,
  LuGithub, LuPackage, LuMessageSquare, LuShieldAlert,
} from "react-icons/lu";

export interface PanelTheme {
  from: string; to: string; surface: string; border: string;
  primary: string; primaryFg: string; accent: string; text: string; muted: string;
}

export interface PanelDef {
  id: string; name: string; tagline: string; description: string;
  icon: IconType; api: string; theme: PanelTheme;
}

export const panels: PanelDef[] = [
  {
    id: "weather", name: "Weather", tagline: "Your local forecast",
    description: "Current conditions and the next two days, using your browser's location.",
    icon: LuCloudSun, api: "Open-Meteo",
    theme: { from: "#0b1e33", to: "#0a2a44", surface: "#0f2c47", border: "#1c4468", primary: "#38bdf8", primaryFg: "#04141f", accent: "#7dd3fc", text: "#eaf6ff", muted: "#9fc4de" },
  },
  {
    id: "currency", name: "Currency", tagline: "Live exchange rates",
    description: "Convert between currencies and see 90 days of history.",
    icon: LuCoins, api: "Frankfurter",
    theme: { from: "#04211a", to: "#053327", surface: "#082e24", border: "#155c46", primary: "#34d399", primaryFg: "#03150f", accent: "#6ee7b7", text: "#e7fbf3", muted: "#96cbb4" },
  },
  {
    id: "crypto", name: "Crypto", tagline: "Ten coins, live prices",
    description: "Price, 24-hour change and a 7-day trend for major cryptocurrencies.",
    icon: LuBitcoin, api: "CoinGecko",
    theme: { from: "#1a0b2e", to: "#28104a", surface: "#20123a", border: "#432171", primary: "#a78bfa", primaryFg: "#0e0620", accent: "#e9d5ff", text: "#f3ecff", muted: "#c9b6ea" },
  },
  {
    id: "hackernews", name: "Hacker News", tagline: "What's on the front page",
    description: "The top stories on Hacker News right now.",
    icon: LuFlame, api: "Hacker News",
    theme: { from: "#2b0e02", to: "#411403", surface: "#331103", border: "#682407", primary: "#fb7a2d", primaryFg: "#1a0800", accent: "#ffb27a", text: "#fff1e6", muted: "#e2ac8b" },
  },
  {
    id: "devto", name: "DEV Community", tagline: "Articles worth reading",
    description: "Trending developer articles from DEV Community.",
    icon: LuNewspaper, api: "DEV Community",
    theme: { from: "#0c0e2e", to: "#141646", surface: "#121437", border: "#2b2f70", primary: "#818cf8", primaryFg: "#080a1e", accent: "#c7d2fe", text: "#eef0ff", muted: "#b3b8e6" },
  },
  {
    id: "github", name: "GitHub", tagline: "Look up any repository",
    description: "Stars, issues and a year of commit activity for any public repo.",
    icon: LuGithub, api: "GitHub REST API",
    theme: { from: "#0d1117", to: "#151b23", surface: "#141a21", border: "#2b3644", primary: "#22d3ee", primaryFg: "#04141a", accent: "#67e8f9", text: "#e6edf3", muted: "#9fb0c0" },
  },
  {
    id: "npm", name: "npm", tagline: "Package downloads",
    description: "Version, size and monthly download trend for any npm package.",
    icon: LuPackage, api: "npm registry",
    theme: { from: "#2b0509", to: "#420810", surface: "#340810", border: "#6b1420", primary: "#fb7185", primaryFg: "#1c0304", accent: "#fda4af", text: "#ffeef0", muted: "#e3aab0" },
  },
  {
    id: "stackoverflow", name: "Stack Overflow", tagline: "Recent activity by tag",
    description: "The most recently active questions for a technology tag.",
    icon: LuMessageSquare, api: "Stack Exchange",
    theme: { from: "#1f0a1c", to: "#33102c", surface: "#280e23", border: "#521f47", primary: "#f472b6", primaryFg: "#1a0715", accent: "#f9a8d4", text: "#fdf0f8", muted: "#dba8c9" },
  },
  {
    id: "security", name: "Security", tagline: "Recent vulnerabilities",
    description: "Recently published CVEs from the National Vulnerability Database.",
    icon: LuShieldAlert, api: "NVD",
    theme: { from: "#1a0505", to: "#2b0707", surface: "#210606", border: "#4a1010", primary: "#f87171", primaryFg: "#1a0303", accent: "#fca5a5", text: "#fdeaea", muted: "#d6a0a0" },
  },
];

export const landingTheme: PanelTheme = {
  from: "#0b0e14", to: "#12131c", surface: "#141621", border: "#2a2d3d",
  primary: "#e2e8f0", primaryFg: "#0b0e14", accent: "#94a3b8", text: "#f1f5f9", muted: "#94a3b8",
};

export const findPanel = (id: string | undefined) => panels.find((p) => p.id === id);
