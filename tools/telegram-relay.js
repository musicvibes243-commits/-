/**
 * Приём заявок с сайта в Telegram.
 *
 * Это Cloudflare Worker — маленькая бесплатная программа на стороне сервера.
 * Она нужна по одной причине: токен бота нельзя класть в код сайта.
 * Сайт открыт всем, и любой посетитель прочитал бы токен в исходниках,
 * а с ним — захватил бы вашего бота. Здесь токен хранится как секрет,
 * снаружи его не видно.
 *
 * Как запустить (10 минут, без установки программ и без банковской карты):
 *
 *   1. Telegram: напишите @BotFather → /newbot → имя бота (любое) →
 *      логин бота, обязательно заканчивается на "bot", например
 *      stroyinvest_zayavki_bot. BotFather пришлёт токен вида
 *      1234567890:AAH... — это пароль от бота, никому не показывайте.
 *
 *   2. Telegram: напишите @userinfobot любое слово → он ответит вашим
 *      числовым Id. Это и есть CHAT_ID.
 *
 *   3. Напишите своему боту "привет" — хотя бы одно сообщение от вас.
 *      Пока вы не начали диалог, бот не имеет права вам писать.
 *
 *   4. dash.cloudflare.com → регистрация по почте → Workers & Pages →
 *      Create → Worker → имя, например zayavki → Deploy → Edit code.
 *      Удалите пример, вставьте весь этот файл, снова Deploy.
 *
 *   5. Тот же экран → Settings → Variables and Secrets → Add:
 *        BOT_TOKEN       = токен из шага 1                        (Secret)
 *        CHAT_ID         = число из шага 2                        (Secret)
 *        ALLOWED_ORIGIN  = https://stroyinvest-mo.ru              (Text)
 *      Адрес — без слеша на конце. Можно перечислить несколько через
 *      запятую, если сайт открывается и на другом адресе.
 *      После добавления секретов нажмите Deploy ещё раз.
 *
 *   6. Откройте адрес воркера (…workers.dev) в браузере. Должна появиться
 *      строка «Релей заявок работает». Значит, всё развёрнуто верно.
 *
 *   7. Вставьте этот адрес в docs/index.html → DELIVERY.telegram
 *      и отправьте тестовую заявку с сайта.
 *
 * Если заявка не приходит: откройте в Cloudflare вкладку Logs (Real-time),
 * отправьте заявку ещё раз и посмотрите, что пишется в консоль. Частые
 * причины — не выполнен шаг 3 или опечатка в CHAT_ID.
 */

export default {
  async fetch(request, env) {
    const cors = corsFor(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // Открыли адрес в браузере — показываем, что воркер жив.
    if (request.method === 'GET') {
      return new Response('Релей заявок работает. Сайт отправляет сюда POST с заявкой.', {
        status: 200,
        headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (request.method !== 'POST') return reply({ error: 'Только POST' }, 405, cors);

    /* Заявку принимаем только со своего сайта. Браузер и так не покажет чужому
       сайту ответ, но запрос до нас дойдёт — а нам не нужны выдуманные заявки
       от того, кто нашёл адрес воркера в исходниках страницы. */
    if (!originAllowed(request, env)) return reply({ error: 'Чужой адрес' }, 403, cors);

    if (!env.BOT_TOKEN || !env.CHAT_ID) return reply({ error: 'Не заданы BOT_TOKEN и CHAT_ID' }, 500, cors);

    let d;
    try { d = await request.json(); } catch { return reply({ error: 'Тело запроса не JSON' }, 400, cors); }

    // Спам-бот заполняет скрытое поле — молча делаем вид, что всё принято.
    if (d._gotcha) return reply({ ok: true }, 200, cors);

    const digits = String(d.phone || '').replace(/\D/g, '');
    if (!String(d.name || '').trim() || digits.length < 10) {
      return reply({ error: 'Нужны имя и телефон' }, 422, cors);
    }

    /* Сообщение собирается блоками, между блоками — пустая строка.
       Пропущенные поля выпадают, лишних пустых строк при этом не остаётся. */
    const lines = [
      `👤 ${esc(d.name)}`,
      `📞 ${esc(d.phone)}`,
      d.place   ? `📍 ${esc(d.place)}` : null,
      d.service ? `🛠 ${esc(d.service)}` : null,
    ].filter(Boolean);

    const blocks = ['🔔 <b>Заявка с сайта</b>', lines.join('\n')];
    if (d.text)   blocks.push(esc(d.text));
    if (d.sentAt) blocks.push(`<i>${esc(d.sentAt)}</i>`);

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text: blocks.join('\n\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!tg.ok) {
      // Не раскрываем наружу ответ Telegram — в нём может быть токен в тексте ошибки.
      console.log('telegram error', tg.status, await tg.text());
      return reply({ error: 'Telegram не принял сообщение' }, 502, cors);
    }
    return reply({ ok: true }, 200, cors);
  },
};

/* Отдаём заголовок только тому адресу, с которого пришёл запрос, и только
   если он в списке разрешённых. Так чужой сайт не сможет пользоваться
   вашим воркером как своим. */
function allowedList(env) {
  return String(env.ALLOWED_ORIGIN || '*')
    .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
}

function originAllowed(request, env) {
  const allowed = allowedList(env);
  if (allowed.includes('*')) return true;
  return allowed.includes(request.headers.get('Origin') || '');
}

function corsFor(request, env) {
  const allowed = allowedList(env);
  const origin = request.headers.get('Origin') || '';
  const allow = allowed.includes('*') ? '*'
    : allowed.includes(origin) ? origin
    : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const reply = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
