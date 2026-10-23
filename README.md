# Odes History Extractor

Standalone local web app that pulls your Miliastra Wonderland Ode (gacha) history.
Requires Node 18+. No dependencies.

    node server.js      # then open http://127.0.0.1:3000

## How it works
1. Opening the Odes history page in-game creates a URL containing a temporary `authkey` (about 24 h).
2. Copy the URL from the in-game history page, use **paimon.moe**'s Method 1, and paste it into the app. <a href="#notes-1">See Notes*</a>
3. The local server calls HoYoverse's history API with the authkey, one banner type at a time,
   paging with `page` and `end_id` until a page comes back short. A small server is needed
   because browsers block direct calls to that API (CORS).
4. Results are shown per banner (totals, rank counts, pity) and can be exported as CSV or JSON.

## Odes API configuration
`config.json` is preconfigured with the Beyond/Odes endpoint path
(`gacha_info/api/getBeyondGachaLog`) and the known banner types: `1000` for Standard Ode
and `2000` for Event Odes. The page size is set to 5 for this endpoint. The server selects
the Global or China endpoint host based on the region setting.

If HoYoverse changes the endpoint or banner codes, inspect the Odes history page's network
requests in-game (or its URL/log) and update `path` and `types` in `config.json`.

## Notes
- Server binds to 127.0.0.1 only and only contacts a fixed host allowlist.
- The authkey grants access to your history only. Don't paste it into sites you don't trust.
- <a id="notes-1">*</a>When using the powershell method, open the Odes' history page first after game launch and then use the cmd. Do not open Genshin's Wish history before getting the Odes' URL.

## TODO

- Make UI look good
- Add image assets