import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const weatherRouter = Router();

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

// Open-Meteo needs no key and covers the whole world, India included.
weatherRouter.get("/", async (req, res) => {
  const { lat, lon } = querySchema.parse(req.query);
  const key = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const data = await cached(key, 10 * 60 * 1000, () => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,pressure_msl,is_day",
    );
    url.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_sum");
    url.searchParams.set("forecast_days", "3");
    url.searchParams.set("timezone", "auto");
    return upstream(url.toString(), {}, "Open-Meteo");
  });
  if (!data || typeof data !== "object") throw new AppError(502, "UPSTREAM_ERROR", "Open-Meteo returned unexpected data.");
  res.json(data);
});
