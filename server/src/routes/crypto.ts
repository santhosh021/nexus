import { Router } from "express";
import { z } from "zod";
import { cached } from "../lib/cache.js";
import { upstream } from "../lib/upstream.js";

export const cryptoRouter = Router();

const IDS = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink";

// CoinGecko's free tier needs no key for these basic endpoints.
cryptoRouter.get("/markets", async (_req, res) => {
  const data = await cached("crypto:markets", 60 * 1000, () =>
    upstream(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${IDS}&price_change_percentage=24h&sparkline=true`,
      {},
      "CoinGecko",
    ),
  );
  res.json(data);
});

const coinSchema = z.object({ id: z.string().trim().min(1).max(60) });

cryptoRouter.get("/coin", async (req, res) => {
  const { id } = coinSchema.parse(req.query);
  const data = await cached(`crypto:coin:${id}`, 5 * 60 * 1000, () =>
    upstream(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`,
      {},
      "CoinGecko",
    ),
  );
  res.json(data);
});
