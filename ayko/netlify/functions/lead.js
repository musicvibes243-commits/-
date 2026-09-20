// Необязательно: присылает заявки с сайта вам в Telegram.
// Нужны переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
// Без них функция отвечает 501, и сайт откроет письмо на вашу почту.

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return json(501, { error: 'not_configured' });

  let d;
  try { d = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'bad_json' }); }
  const clean = (v, n) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);
  const name = clean(d.name, 100), contact = clean(d.contact, 150), note = clean(d.note, 1500);
  if (!name || !contact) return json(400, { error: 'missing' });

  const text = `Новая заявка с сайта\n\nИмя: ${name}\nКонтакт: ${contact}\n\n${note}`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    if (!r.ok) { console.error('Telegram error', r.status, await r.text()); return json(502, { error: 'upstream' }); }
    return json(200, { ok: true });
  } catch (e) {
    console.error(e);
    return json(502, { error: 'network' });
  }
};
