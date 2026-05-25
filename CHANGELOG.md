# Changelog

All notable changes to `@LibermallIDbot` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-05-25

### Added
- First public release under the LiberMall organization.
- Tier-1 `README.md` with badges, architecture diagram, repo layout, full quickstart, configuration table and roadmap.
- `LICENSE` (MIT with brand protection), `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`.
- `.editorconfig` for consistent indentation across editors.
- npm scope `@libermall/id-bot` in `package.json` with keywords, repository, homepage and bugs URL.

### Changed
- Repository moved from `DeFiTON/libermall-id-bot` to `LiberMall/libermall-id-bot`.
- Documentation language: Russian → English (English-only for all repo files; bot remains bilingual at runtime).
- `.env.example` comments translated to English.

## [0.1.0] — 2026-05-24

### Added
- `/start`, `/apps`, `/profile`, `/help` command handlers.
- RU / EN auto-detection via Telegram `language_code`.
- `webApp` button opening the Mini App at [`id.libermall.com/app/`](https://id.libermall.com/app/).
- Inline button list of every ecosystem product.
- Telegraf middleware calling `syncUserToCasdoor()` on every update — non-blocking sync of `tg_chat_id`, `tg_language_code`, `tg_is_premium`, `tg_last_seen`.
- Dockerfile + `docker-compose.yml` for one-command deployment.
- `.env.example` documenting every environment variable.
- Long-poll mode for development, webhook mode for production (auto-detected via `WEBHOOK_URL`).
