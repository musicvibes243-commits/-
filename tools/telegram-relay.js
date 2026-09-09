/**
 * Приём заявок с сайта в Telegram.
 *
 * Это Cloudflare Worker — маленькая бесплатная программа на стороне сервера.
 * Она нужна по одной причине: токен бота нельзя класть в код сайта.
 * Сайт открыт всем, и любой посетитель прочитал бы токен в исходниках,
 * а с ним — захватил бы вашего бота. Здесь токен хранится как секрет,
 * снаружи его не видно.
 *
 * Как запустить (10 минут, без установки программ):
 *   1. Telegram: напишите @BotFather → /newbot → придумайте имя.
 *      BotFather пришлёт токен вида 1234567890:AAH...  — сохраните.
 *   2. Telegram: напишите @userinfobot → он пришлёт ваш chat id (число).
 *   3. dash.cloudflare.com → регистрация → Workers & Pages → Create → Worker.
 *   4. Назовите воркер, нажмите Deploy, потом Edit code.
 *      Удалите пример, вставьте весь этот файл, снова Deploy.
 *   5. Settings → Variables and Secrets → Add:
 *        BOT_TOKEN       = токен из шага 1   (тип Secret)
 *        CHAT_ID         = число из шага 2   (тип Secret)
 *        ALLOWED_ORIGIN  = адрес вашего сайта, например
 *                          https://musicvibes243-commits.github.io   (тип Text)
 *   6. Скопируйте адрес воркера (…workers.dev) и вставьте его
 *      в docs/index.html → DELIVERY.telegram
 */

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply({ error: 'Только POST' }, 405, cors);
    if (!env.BOT_TOKEN || !env.CHAT_ID) return reply({ error: 'Не заданы BOT_TOKEN и CHAT_ID' }, 500, cors);

    let d;
    try { d = await request.json(); } catch { return reply({ error: 'Тело запроса не JSON' }, 400, cors); }

    // Спам-бот заполняет скрытое поле — молча делаем вид, что всё принято.
    if (d._gotcha) return reply({ ok: true }, 200, cors);

    const digits = String(d.phone || '').replace(/\D/g, '');
    if (!String(d.name || '').trim() || digits.length < 10) {
      return reply({ error: 'Нужны имя и телефон' }, 422, cors);
    }

    const rows = [
      '🔔 <b>Заявка с сайта</b>',
      '',
      `👤 ${esc(d.name)}`,
      `📞 ${esc(d.phone)}`,
      d.place   ? `📍 ${esc(d.place)}` : '',
      d.service ? `🛠 ${esc(d.service)}` : '',
      d.text    ? `\n${esc(d.text)}` : '',
      '',
      `<i>${esc(d.sentAt || '')}</i>`,
    ].filter(Boolean);

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text: rows.join('\n'),
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

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const reply = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
