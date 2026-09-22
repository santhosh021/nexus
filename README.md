# Nexus — Where public data lives

Ten free public APIs, each with its own theme and view. React + TypeScript client, a small Node/Express proxy
that keeps API keys off the browser, no database, no accounts.

## Run locally (Node 20.19+)

Terminal 1:
```
cd server
npm install
cp .env.example .env   # optional: add your own free keys for higher rate limits
npm run dev             # http://localhost:4500
```
Terminal 2:
```
cd client
npm install
npm run dev              # http://localhost:5175
```

## Free keys (all optional)
Every panel works with no key, at a lower rate limit. Add a key to `server/.env` for more headroom:
- `GITHUB_TOKEN` — a fine-grained personal access token, Public Repositories (read-only). github.com → Settings → Developer settings → Personal access tokens.
- `STACK_APPS_KEY` — stackapps.com → Register Application → copy the "Key" field.
- `NVD_API_KEY` — nvd.nist.gov/developers/request-an-api-key, arrives by email.

## Add an 11th panel
1. Add a proxy route in `server/src/routes/`, wire it in `server/src/app.ts`.
2. Add an entry to the `panels` array in `client/src/data/panels.ts` with its own theme colours.
3. Add a component in `client/src/panels/` and register it in `PANEL_COMPONENTS` in `client/src/App.tsx`.

## Deploy (Portainer)
Stack from this repo using `docker-compose.yml`. Add `GITHUB_TOKEN`, `STACK_APPS_KEY`, `NVD_API_KEY` as stack
environment variables (all optional). It joins the `edge` network as `nexus-web`.
In Cloudflare, route `nexus.imsanthosh.tech` to `http://nexus-web:80`.

## Notes
- Every panel is proxied through the server, so no key or secret ever reaches the browser.
- Data is cached briefly in memory per panel to stay well inside each free API's rate limit.
