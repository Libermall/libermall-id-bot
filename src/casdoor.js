// Sync TG-юзера с Casdoor через admin API.
// Сохраняем chat_id, language_code, premium status в properties юзера если он есть в Casdoor.

const BASE = process.env.CASDOOR_URL || 'https://id.libermall.com';
const ADMIN_USER = process.env.CASDOOR_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.CASDOOR_ADMIN_PASS || '';

let cachedCookie = null;
let cookieExpiry = 0;

async function getAdminCookie() {
  const now = Date.now();
  if (cachedCookie && now < cookieExpiry) return cachedCookie;

  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application: 'app-built-in',
      organization: 'built-in',
      username: ADMIN_USER,
      password: ADMIN_PASS,
      type: 'login',
      autoSignin: true,
    }),
  });
  if (!res.ok) throw new Error(`admin login failed: ${res.status}`);
  const setCookie = res.headers.get('set-cookie');
  cachedCookie = setCookie ? setCookie.split(';')[0] : null;
  cookieExpiry = now + 1000 * 60 * 60; // 1h
  return cachedCookie;
}

export async function syncUserToCasdoor(tgUser) {
  if (!ADMIN_PASS || !tgUser?.id) return;

  // Ищем юзера по tg_id (можно по username/external_id/properties)
  // Casdoor user identified by tg_username = "tg_<id>" в нашей конвенции.
  // Если найден — обновляем properties с chat_id + language_code.

  try {
    const cookie = await getAdminCookie();
    // Простой sync: апдейт properties юзера identified by id в любом app
    const tgId = String(tgUser.id);

    // get-user by tg id (try by name field 'tg_<id>' in organization libermall)
    const candidates = [
      `${BASE}/api/get-user?id=libermall/tg_${tgId}`,
      `${BASE}/api/get-user?id=libermall/${tgUser.username || ''}`,
    ];
    let user = null;
    for (const url of candidates) {
      const r = await fetch(url, { headers: { Cookie: cookie } });
      if (!r.ok) continue;
      const j = await r.json();
      if (j?.data) { user = j.data; break; }
    }
    if (!user) return; // юзер ещё не создан — нечего sync

    user.properties = user.properties || {};
    user.properties.tg_chat_id = tgId;
    user.properties.tg_language_code = tgUser.language_code || '';
    user.properties.tg_is_premium = tgUser.is_premium ? '1' : '0';
    user.properties.tg_last_seen = new Date().toISOString();

    await fetch(`${BASE}/api/update-user?id=${user.owner}/${user.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(user),
    });
  } catch (e) {
    console.warn('syncUserToCasdoor', e?.message);
  }
}
