# Contributing to @LibermallIDbot

Thanks for considering a contribution! This bot is part of the [Libermall ID](https://id.libermall.com) ecosystem.

## Quick start

```bash
git clone git@github.com:LiberMall/libermall-id-bot.git
cd libermall-id-bot
cp .env.example .env
# fill TG_BOT_TOKEN
npm install
node --watch src/index.js
```

The bot starts in long-poll mode — no webhook setup needed for local development.

## Project layout

```
src/
├── index.js     ← Telegraf entry, command handlers, middleware
├── casdoor.js   ← admin-API sync (chat_id, language, premium, last_seen)
└── products.js  ← ecosystem product list shown in /apps
```

## Code style

- ES modules (`import` / `export`)
- Node 20+ — use built-in features (`node --watch`, `node --env-file`, `fetch`)
- 2-space indent, trailing commas, single quotes
- No build step, no transpilation
- One concern per file

## Adding a new command

1. Add the handler in `src/index.js`:
   ```js
   bot.command('myhello', async (ctx) => {
     const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
     await ctx.reply(isRu ? 'Привет' : 'Hello');
   });
   ```
2. Register it with [@BotFather](https://t.me/BotFather):
   ```
   /setcommands @LibermallIDbot
   myhello - Say hello
   ```
3. Update the `Commands` table in [`README.md`](README.md).
4. Add an entry under `## Unreleased` in [`CHANGELOG.md`](CHANGELOG.md).

## Adding a new ecosystem product

Add an entry to `src/products.js`:

```js
{
  name: 'My new product',
  url: 'https://my.libermall.com',
  emoji: '🚀',
  description: { ru: 'Что это', en: 'What it is' },
}
```

It will show up in `/apps` automatically.

## RU / EN copy

The bot is bilingual. Every user-facing string must have both variants. Use this pattern:

```js
const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
const text = isRu ? 'Русский текст' : 'English text';
```

Brand: always **Libermall** (capital L, rest lowercase) — both in RU and EN.

## Pull-request checklist

- [ ] Branch from `main`, name `topic/short-description`
- [ ] One logical change per PR
- [ ] Tested locally with `node --watch src/index.js`
- [ ] Both RU and EN copy added where applicable
- [ ] `README.md` updated if commands changed
- [ ] `CHANGELOG.md` entry under `## Unreleased`
- [ ] No secrets committed (`.env` is `.gitignore`'d — keep it that way)

## Code of conduct

Be specific, be kind, ship great work.

## License

By contributing you agree your code is licensed under [MIT](LICENSE).
