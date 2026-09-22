import { useEffect, useState } from "react";
import { LuLocateFixed, LuTriangleAlert, LuDroplets, LuWind, LuGauge, LuSunrise, LuSunset, LuCloudRain } from "react-icons/lu";
import { findPanel } from "../data/panels";
import { useFetch } from "../hooks/useFetch";
import { Card, ErrorBox, PanelHeader, Skeleton } from "../components/PanelChrome";

const panel = findPanel("weather")!;
const theme = panel.theme;

const CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing fog", 51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent showers", 95: "Thunderstorm", 96: "Thunderstorm with hail",
};
const describe = (code: number) => CODES[code] ?? "Unknown conditions";
const compass = (deg: number) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

interface WeatherResponse {
  current: {
    temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number;
    wind_speed_10m: number; wind_direction_10m: number; wind_gusts_10m: number;
    precipitation: number; cloud_cover: number; pressure_msl: number; is_day: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[]; precipitation_probability: number[] };
  daily: {
    time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[];
    uv_index_max: number[]; sunrise: string[]; sunset: string[]; precipitation_sum: number[];
  };
}

// Chennai, since most visitors here are in India and it needs a sensible default.
const DEFAULT_LOCATION = { lat: 13.0827, lon: 80.2707, label: "Chennai" };

/** BigDataCloud's free client-side reverse geocoder: coordinates in, a place name out, no key. */
async function lookupPlaceName(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (!res.ok) return null;
    const data = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };
    const place = data.city || data.locality;
    if (!place) return null;
    return data.countryName ? `${place}, ${data.countryName}` : place;
  } catch {
    return null;
  }
}

export function Weather() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [permission, setPermission] = useState<"asking" | "granted" | "denied">("asking");

  useEffect(() => {
    if (!("geolocation" in navigator)) { setCoords(DEFAULT_LOCATION); setPlaceName(DEFAULT_LOCATION.label); setPermission("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(point);
        setPermission("granted");
        lookupPlaceName(point.lat, point.lon).then((name) => setPlaceName(name ?? "Your location"));
      },
      () => { setCoords(DEFAULT_LOCATION); setPlaceName(DEFAULT_LOCATION.label); setPermission("denied"); },
      { timeout: 8000 },
    );
  }, []);

  const url = coords ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}` : null;
  const { data, error, loading } = useFetch<WeatherResponse>(url);

  return (
    <>
      <PanelHeader panel={panel} right={
        <span className="flex items-center gap-1.5 text-sm" style={{ color: theme.muted }}>
          {permission === "denied" ? <LuTriangleAlert className="size-4" /> : <LuLocateFixed className="size-4" />}
          {placeName ?? "Locating…"}
        </span>
      } />
      {!coords || loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton theme={theme} className="h-40" /><Skeleton theme={theme} className="h-40" />
        </div>
      ) : error ? (
        <ErrorBox theme={theme} message={error} source="Open-Meteo" />
      ) : data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card theme={theme} className="flex flex-col items-center justify-center py-10 text-center">
              <p className="font-display text-7xl" style={{ color: theme.primary }}>{Math.round(data.current.temperature_2m)}°</p>
              <p className="mt-2 text-lg">{describe(data.current.weather_code)}</p>
              <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                Feels like {Math.round(data.current.apparent_temperature)}° · H:{Math.round(data.daily.temperature_2m_max[0] ?? 0)}° L:{Math.round(data.daily.temperature_2m_min[0] ?? 0)}°
              </p>
            </Card>
            <Card theme={theme}>
              <p className="mb-3 text-sm font-medium" style={{ color: theme.muted }}>Next 24 hours</p>
              <div className="no-scrollbar flex gap-3 overflow-x-auto">
                {data.hourly.time.slice(0, 12).map((time, i) => (
                  <div key={time} className="flex shrink-0 flex-col items-center gap-1 text-center">
                    <span className="text-xs" style={{ color: theme.muted }}>{new Date(time).getHours()}:00</span>
                    <span className="font-display text-xl">{Math.round(data.hourly.temperature_2m[i] ?? 0)}°</span>
                    <span className="text-[10px]" style={{ color: theme.accent }}>{data.hourly.precipitation_probability[i] ?? 0}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: LuDroplets, label: "Humidity", value: `${data.current.relative_humidity_2m}%` },
              { icon: LuWind, label: "Wind", value: `${Math.round(data.current.wind_speed_10m)} km/h ${compass(data.current.wind_direction_10m)}`, sub: `Gusts ${Math.round(data.current.wind_gusts_10m)} km/h` },
              { icon: LuGauge, label: "Pressure", value: `${Math.round(data.current.pressure_msl)} hPa` },
              { icon: LuCloudRain, label: "Precipitation", value: `${data.current.precipitation} mm`, sub: `Today ${data.daily.precipitation_sum[0] ?? 0} mm` },
            ].map(({ icon: Icon, label, value, sub }) => (
              <Card key={label} theme={theme} className="text-center">
                <Icon className="mx-auto size-5" style={{ color: theme.primary }} />
                <p className="mt-2 text-xs" style={{ color: theme.muted }}>{label}</p>
                <p className="font-medium">{value}</p>
                {sub && <p className="text-[11px]" style={{ color: theme.muted }}>{sub}</p>}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card theme={theme} className="text-center"><LuSunrise className="mx-auto size-5" style={{ color: theme.primary }} /><p className="mt-2 text-xs" style={{ color: theme.muted }}>Sunrise</p><p className="font-medium">{clock(data.daily.sunrise[0] ?? "")}</p></Card>
            <Card theme={theme} className="text-center"><LuSunset className="mx-auto size-5" style={{ color: theme.primary }} /><p className="mt-2 text-xs" style={{ color: theme.muted }}>Sunset</p><p className="font-medium">{clock(data.daily.sunset[0] ?? "")}</p></Card>
            <Card theme={theme} className="text-center"><p className="text-xs" style={{ color: theme.muted }}>UV index</p><p className="mt-3 font-medium">{Math.round(data.daily.uv_index_max[0] ?? 0)}</p></Card>
            <Card theme={theme} className="text-center"><p className="text-xs" style={{ color: theme.muted }}>Cloud cover</p><p className="mt-3 font-medium">{data.current.cloud_cover}%</p></Card>
          </div>

          <Card theme={theme}>
            <p className="mb-3 text-sm font-medium" style={{ color: theme.muted }}>Next 3 days</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {data.daily.time.map((day, i) => (
                <div key={day}>
                  <p className="text-xs" style={{ color: theme.muted }}>{new Date(day).toLocaleDateString(undefined, { weekday: "short" })}</p>
                  <p className="mt-1 text-sm">{describe(data.daily.weather_code[i] ?? 0)}</p>
                  <p className="mt-1 font-medium">{Math.round(data.daily.temperature_2m_max[i] ?? 0)}° / {Math.round(data.daily.temperature_2m_min[i] ?? 0)}°</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
      <p className="mt-6 text-xs" style={{ color: theme.muted }}>
        {permission === "denied" ? "Location access was not available, so this shows Chennai. Allow location access and reload for your own forecast." : "Using your browser's location."}
      </p>
    </>
  );
}
