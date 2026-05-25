import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import { syncUserToCasdoor } from './casdoor.js';
import { PRODUCTS } from './products.js';

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://id.libermall.com/app/';
const LOGIN_URL = process.env.LOGIN_URL || 'https://id.libermall.com/';

bot.use(async (ctx, next) => {
  if (ctx.from) {
    // Non-blocking — sync runs in the background.
    syncUserToCasdoor(ctx.from).catch(err => console.warn('casdoor sync failed', err?.message));
  }
  return next();
});

bot.start(async (ctx) => {
  const first = ctx.from?.first_name || '';
  const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');

  const text = isRu
    ? `👋 Привет, ${first}!\n\n*Libermall ID* — единый аккаунт для всей экосистемы Libermall.\n\nОткройте Mini App, чтобы:\n• Привязать сервисы и кошельки\n• Управлять профилем\n• Видеть активность по всем продуктам`
    : `👋 Hi, ${first}!\n\n*Libermall ID* is one account for the whole Libermall ecosystem.\n\nOpen the Mini App to:\n• Link services and wallets\n• Manage your profile\n• See activity across all products`;

  await ctx.replyWithMarkdown(text, Markup.inlineKeyboard([
    [Markup.button.webApp(isRu ? '🚀 Открыть Mini App' : '🚀 Open Mini App', MINI_APP_URL)],
    [Markup.button.url(isRu ? '🌐 Сайт Libermall ID' : '🌐 Libermall ID website', LOGIN_URL)],
    [Markup.button.callback(isRu ? '📦 Продукты экосистемы' : '📦 Ecosystem products', 'apps')],
  ]));
});

bot.help(async (ctx) => {
  const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
  const text = isRu
    ? `*Libermall ID* — что это:\n\n🔐 Один аккаунт для входа во все продукты Libermall: Sites.Reviews, TonChat AI, TON.CEO, DEX, Card, Marketplace.\n\n⚡ Telegram-вход за один клик, TON Connect для криптокошельков, OpenID Connect / OAuth 2.0 для разработчиков.\n\n*Команды:*\n/start — главное меню\n/apps — список продуктов\n/profile — открыть Mini App\n/help — помощь`
    : `*Libermall ID* — what is it:\n\n🔐 One account for all Libermall products: Sites.Reviews, TonChat AI, TON.CEO, DEX, Card, Marketplace.\n\n⚡ One-click Telegram login, TON Connect for crypto wallets, OpenID Connect / OAuth 2.0 for developers.\n\n*Commands:*\n/start — main menu\n/apps — products\n/profile — open Mini App\n/help — help`;
  await ctx.replyWithMarkdown(text);
});

bot.command(['apps', 'products'], async (ctx) => sendApps(ctx));
bot.action('apps', async (ctx) => { await ctx.answerCbQuery(); return sendApps(ctx); });

async function sendApps(ctx) {
  const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
  const title = isRu ? '*Продукты экосистемы Libermall:*' : '*Libermall ecosystem products:*';
  const buttons = PRODUCTS.map(p => [Markup.button.url(`${p.emoji} ${p.name}`, p.url)]);
  buttons.push([Markup.button.webApp(isRu ? '🚀 Mini App' : '🚀 Mini App', MINI_APP_URL)]);
  await ctx.replyWithMarkdown(title, Markup.inlineKeyboard(buttons));
}

bot.command('profile', async (ctx) => {
  const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
  await ctx.reply(
    isRu ? 'Откройте Mini App, чтобы увидеть свой профиль:' : 'Open Mini App to see your profile:',
    Markup.inlineKeyboard([
      [Markup.button.webApp(isRu ? '🚀 Открыть профиль' : '🚀 Open profile', MINI_APP_URL)],
    ])
  );
});

bot.on('text', async (ctx) => {
  const isRu = (ctx.from?.language_code || '').toLowerCase().startsWith('ru');
  await ctx.reply(
    isRu
      ? 'Я понимаю команды:\n/start /apps /profile /help'
      : 'I understand commands:\n/start /apps /profile /help'
  );
});

bot.catch((err, ctx) => {
  console.error('Bot error', err);
});

// ───────────────────────────── start ─────────────────────────────
const useWebhook = process.env.WEBHOOK_URL && process.env.WEBHOOK_SECRET;

if (useWebhook) {
  const port = parseInt(process.env.PORT || '3000', 10);
  bot.launch({
    webhook: {
      domain: process.env.WEBHOOK_URL,
      hookPath: '/webhook/' + process.env.WEBHOOK_SECRET,
      port,
    },
  });
  console.log(`Bot running in webhook mode on port ${port}, hook: ${process.env.WEBHOOK_URL}/webhook/${process.env.WEBHOOK_SECRET}`);
} else {
  bot.launch();
  console.log('Bot running in long-poll mode');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
