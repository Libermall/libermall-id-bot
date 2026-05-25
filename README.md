<div align="center">

# @LibermallIDbot

**The official Telegram bot for [Libermall ID](https://id.libermall.com)** — single sign-on for the entire Libermall ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-FFD60A.svg?style=flat-square)](LICENSE)
[![Bot](https://img.shields.io/badge/Telegram-@LibermallIDbot-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/LibermallIDbot)
[![Identity](https://img.shields.io/badge/Identity-id.libermall.com-FFD60A?style=flat-square&logo=safari&logoColor=black)](https://id.libermall.com)
[![Node](https://img.shields.io/badge/Node-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-4.16-0088CC?style=flat-square)](https://telegraf.js.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](Dockerfile)

[**Try the bot**](https://t.me/LibermallIDbot) · [**Mini App**](https://id.libermall.com/app/) · [**Identity service**](https://id.libermall.com) · [**Landing site repo**](https://github.com/LiberMall/libermall-id-landing)

</div>

---

## What is this?

`@LibermallIDbot` is the Telegram surface of [Libermall ID](https://id.libermall.com) — the open identity layer that powers every product in the Libermall ecosystem. Users open the bot, tap one button, and they're signed in across [Libermall DEX](https://dex.libermall.com), [PayLibermall](https://pay.libermall.com), [Libermall Card](https://card.libermall.com) and the [Libermall marketplace](https://libermall.com).

The bot is bilingual (RU / EN), auto-detected from `language_code`, and keeps Casdoor's user properties in sync with their current Telegram state.

## Commands

| Command | What it does |
|---|---|
| `/start` | Welcome + Mini App button + main menu |
| `/apps` | List of every ecosystem product with deep links |
| `/profile` | Open the Mini App on the profile screen |
| `/help` | Short pitch + command list |

The bot also runs a Telegraf middleware that calls `syncUserToCasdoor()` on every update — non-blocking — so chat id, language, premium status and `last_seen` stay fresh in your IdP.

## Architecture

```
┌─────────────────────────┐
│   Telegram client       │
└───────────┬─────────────┘
            │ webhook or long poll
            ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│  Telegraf bot (Node 20) │  HTTPS  │  Casdoor admin API       │
│   src/index.js          │────────▶│  syncUserToCasdoor()     │
└───────────┬─────────────┘         └─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│  Mini App (WebApp)      │
│  id.libermall.com/app/  │
└─────────────────────────┘
```

Single instance, single tenant, single bot token — keeps the deployment under 50 MB RAM and zero scaling worries.

## Repository layout

```
libermall-id-bot/
├── README.md            ← you are here
├── LICENSE              ← MIT
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
├── .editorconfig
└── src/
    ├── index.js         ← bot entry-point, command handlers
    ├── casdoor.js       ← admin-API sync (chat_id, lang, premium, last_seen)
    └── products.js      ← ecosystem product list shown on /apps
```

## Quickstart

### 1. Create a bot in Telegram

Talk to [@BotFather](https://t.me/BotFather):

```
/newbot
  → name: Libermall ID
  → username: anything ending in "bot"
/setdomain @your_bot
  → id.libermall.com   (so the Mini App opens)
/setcommands @your_bot
  → start - Welcome screen
  → apps - Ecosystem products
  → profile - Open Mini App
  → help - Help
```

Save the token — you'll paste it as `TG_BOT_TOKEN` below.

### 2. Run locally (long-poll)

```bash
git clone git@github.com:LiberMall/libermall-id-bot.git
cd libermall-id-bot
cp .env.example .env
# Fill in TG_BOT_TOKEN (and CASDOOR_ADMIN_PASS if you want the sync)
docker compose up -d
docker compose logs -f
```

That's it. The bot polls Telegram from your machine.

### 3. Run in production (webhook)

In `.env` set:

```bash
WEBHOOK_URL=https://your-domain.com
WEBHOOK_SECRET=$(openssl rand -hex 32)
```

Then point `nginx` at `bot:3000`:

```nginx
location /webhook/<your-secret> {
  proxy_pass         http://127.0.0.1:3000/webhook/<your-secret>;
  proxy_set_header   Host $host;
  proxy_set_header   X-Real-IP $remote_addr;
}
```

Telegraf registers the webhook automatically on boot.

## Configuration

All configuration is environment variables (12-factor). See [`.env.example`](.env.example) for the full list.

| Variable | Required? | What |
|---|---|---|
| `TG_BOT_TOKEN` | yes | Token from [@BotFather](https://t.me/BotFather) |
| `WEBHOOK_URL` | optional | If empty, the bot uses long-poll |
| `WEBHOOK_SECRET` | only with webhook | Random secret in the webhook path |
| `MINI_APP_URL` | default `https://id.libermall.com/app/` | The Mini App opened from the buttons |
| `LOGIN_URL` | default `https://id.libermall.com/` | Landing page URL |
| `CASDOOR_URL` | optional | If set, enables Casdoor user-properties sync |
| `CASDOOR_ADMIN_USER` | optional | Casdoor admin (typically `admin`) |
| `CASDOOR_ADMIN_PASS` | optional | Casdoor admin password |
| `PORT` | default `3000` | HTTP port for the webhook |

## Casdoor sync

If `CASDOOR_URL`, `CASDOOR_ADMIN_USER`, and `CASDOOR_ADMIN_PASS` are set, the bot's Telegraf middleware:

1. Looks up the user by `tg_<id>` or `username` in the `libermall` organization.
2. Updates these `properties` if the user exists:
   - `tg_chat_id`
   - `tg_language_code`
   - `tg_is_premium`
   - `tg_last_seen`
3. Skips silently if the user hasn't signed in via Libermall ID yet (no row to update).

The sync is non-blocking — failures only log a warning and never delay the bot's reply.

## Development

```bash
npm install
node --watch src/index.js
```

Hot reload via Node 20's built-in `--watch` flag — no nodemon needed.

## Deploy

```bash
docker compose build
docker compose up -d --force-recreate
```

The Dockerfile uses `node:20-alpine` (~50 MB final image).

## Roadmap

- [x] `/start`, `/apps`, `/profile`, `/help`
- [x] RU / EN auto-detection via `language_code`
- [x] Casdoor admin-API sync of TG properties
- [x] Mini App button + product deep links
- [ ] `/security` command → vulnerability disclosure flow
- [ ] OAuth-login flow inside the bot (request a one-time code, scan, sign in)
- [ ] TON Connect signature flow inside the bot
- [ ] Magic-link generation directly from chat
- [ ] Account recovery via Telegram

## Contributing

PRs welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

To report a vulnerability, see [`SECURITY.md`](SECURITY.md) — please don't open a public issue.

## License

[MIT](LICENSE) © 2026 Libermall.

The `Libermall` wordmark and the M-shield logo are trademarks of Libermall and are not covered by this MIT License; see the brand guidelines in [`LiberMall/libermall-id-landing`](https://github.com/LiberMall/libermall-id-landing/blob/main/BRANDBOOK.md).

---

<div align="center">

**Part of the [Libermall ecosystem](https://libermall.com).**

[Identity](https://id.libermall.com) · [DEX](https://dex.libermall.com) · [Pay](https://pay.libermall.com) · [Card](https://card.libermall.com)

</div>
