# @LibermallIDbot

Telegram-бот для [Libermall ID](https://id.libermall.com) — единого SSO экосистемы Libermall.

## Команды

| Команда | Что делает |
|---|---|
| `/start` | Приветствие + кнопка Mini App + меню |
| `/apps` | Список продуктов экосистемы с deeplinks |
| `/profile` | Открыть Mini App с профилем |
| `/help` | Описание Libermall ID + список команд |

Поддержка RU/EN автоматически по `language_code`.

## Deploy

```bash
git clone https://github.com/DeFiTON/libermall-id-bot.git
cd libermall-id-bot
cp .env.example .env
# заполнить TG_BOT_TOKEN, CASDOOR_ADMIN_PASS
docker compose up -d
```

## Webhook

Бот может работать в long-poll режиме (без webhook) — оставить `WEBHOOK_URL` пустым.

Для webhook:
```
WEBHOOK_URL=https://id.libermall.com
WEBHOOK_SECRET=случайная_строка
```

Nginx-route `/webhook/<secret>` должен проксироваться на `bot:3000`.

## Casdoor sync

При каждом сообщении бот пытается найти юзера в Casdoor (organization `libermall`) по `tg_<id>` или username, и обновляет `properties`:
- `tg_chat_id`
- `tg_language_code`
- `tg_is_premium`
- `tg_last_seen`

Если юзер ещё не создан в Casdoor (не логинился через Libermall ID) — sync skip.

## Архитектура

Telegraf framework, Node.js 20, ES modules. Single instance — без масштабирования (single-tenant SSO).

## Open Source

MIT, репо публичный. Не содержит секретов — токены через .env.
