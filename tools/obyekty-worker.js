/**
 * Синхронизация объектов и утренняя сводка в Telegram.
 *
 * Это второй Cloudflare Worker, рядом с `zayavki`. Делает три вещи:
 *
 *   1. Хранит объекты вне телефона. Телефон можно утопить, разбить
 *      и потерять; записи после этого остаются здесь.
 *   2. Сводит записи с двух телефонов в один список — мастер и жена
 *      видят одно и то же.
 *   3. Каждое утро в 8:00 по Москве присылает мастеру в Telegram,
 *      кому сегодня звонить и что просрочено.
 *
 * ПОЧЕМУ УТРЕННЯЯ СВОДКА, А НЕ УВЕДОМЛЕНИЕ ПРИЛОЖЕНИЯ. Пока страницу
 * не открыли, она не работает и разбудить телефон не может. Разбудить
 * умеет только то, что живёт снаружи. А Telegram мастер и так читает
 * пятьдесят раз в день — туда сообщение дойдёт вернее, чем куда-либо ещё.
 *
 * КАК ЗАПУСТИТЬ (минут пятнадцать, деньги не нужны)
 *
 *   1. dash.cloudflare.com → Workers & Pages → Create → Worker →
 *      имя `obyekty` → Deploy → Edit code. Удалить пример, вставить
 *      весь этот файл, снова Deploy.
 *
 *   2. Хранилище. Слева Storage & Databases → KV → Create namespace →
 *      имя `obyekty-kv` → Add.
 *      Затем воркер → Settings → Bindings → Add → KV namespace:
 *        Variable name: OBYEKTY
 *        KV namespace:  obyekty-kv
 *
 *   3. Там же Settings → Variables and Secrets → Add:
 *        BOT_TOKEN      = токен бота заявок (тот же, что у `zayavki`)   Secret
 *        CHAT_ID        = числовой Id мастера, кому слать сводку        Secret
 *        KLYUCH         = придуманное слово-пароль бригады              Secret
 *        ALLOWED_ORIGIN = https://stroyinvest-mo.ru                     Text
 *      После добавления — Deploy ещё раз.
 *
 *      KLYUCH — это пароль к списку объектов. Его же вводят в приложении
 *      на каждом телефоне. Без него адрес воркера бесполезен: в списке
 *      лежат имена и телефоны заказчиков, и отдавать их кому попало нельзя.
 *
 *   4. Расписание. Воркер → Settings → Triggers → Cron Triggers → Add →
 *      `0 5 * * *`. Это 5 утра по Гринвичу, то есть 8:00 по Москве.
 *
 *   5. Открыть адрес воркера в браузере — должна появиться строка
 *      «Синхронизация объектов работает». Затем вписать этот адрес
 *      и KLYUCH в приложении: «Отчёт» → «Общий список».
 *
 * Токенов и паролей в этом файле нет: всё лежит секретами на стороне
 * Cloudflare. Сам файл можно показывать кому угодно.
 */

export default {
  async fetch(request, env) {
    const cors = corsFor(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (request.method === 'GET') {
      return new Response('Синхронизация объектов работает. Приложение отправляет сюда список.', {
        status: 200,
        headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (request.method !== 'POST') return otvet({ error: 'Только POST' }, 405, cors);
    if (!originAllowed(request, env)) return otvet({ error: 'Чужой адрес' }, 403, cors);
    if (!env.OBYEKTY) return otvet({ error: 'Не подключено хранилище KV (binding OBYEKTY)' }, 500, cors);

    let d;
    try { d = await request.json(); } catch { return otvet({ error: 'Тело запроса не JSON' }, 400, cors); }

    /* Сравниваем пароль посимвольно до конца, не выходя на первом
       несовпадении. Так по времени ответа нельзя подбирать его по букве. */
    if (!env.KLYUCH || !ravny(String(d.klyuch || ''), String(env.KLYUCH))) {
      return otvet({ error: 'Неверный ключ бригады' }, 403, cors);
    }

    const bylo = await prochitat(env);
    const stalo = slit(bylo, Array.isArray(d.obj) ? d.obj : []);
    await env.OBYEKTY.put('obyekty', JSON.stringify(stalo));

    return otvet({ ok: true, obj: stalo, kogda: Date.now() }, 200, cors);
  },

  /* Срабатывает по расписанию из шага 4. */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(utrennyayaSvodka(env));
  },
};

/* ===== Слияние двух телефонов =====

   Простая отправка «мой список целиком» потеряла бы записи: кто сохранил
   последним, того список и остался бы, а второй телефон затёрся бы молча.
   Поэтому сверяем по объектам: у каждого есть время последней правки,
   и побеждает та версия, которую правили позже.

   Удаление — это тоже правка, а не исчезновение из списка. Иначе удалённый
   объект вернулся бы со второго телефона, где про удаление не знают. */
function slit(bylo, prishlo) {
  const po_id = new Map();
  for (const o of bylo) if (o && o.id) po_id.set(o.id, o);
  for (const o of prishlo) {
    if (!o || !o.id) continue;
    const staryy = po_id.get(o.id);
    if (!staryy || (Number(o.izmenen) || 0) >= (Number(staryy.izmenen) || 0)) po_id.set(o.id, o);
  }
  return [...po_id.values()];
}

async function prochitat(env) {
  try {
    const s = await env.OBYEKTY.get('obyekty');
    const d = s ? JSON.parse(s) : [];
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

/* ===== Утренняя сводка ===== */

/* Москва круглый год на UTC+3, перевода часов нет с 2014 года. */
function segodnyaMsk() {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

function poRusski(iso) {
  if (!iso) return '';
  const c = iso.split('-');
  return c.length === 3 ? `${c[2]}.${c[1]}.${c[0]}` : iso;
}

function dney(ot, do_) {
  return Math.round((Date.parse(do_) - Date.parse(ot)) / 86400000);
}

function skolkoDney(n) {
  const sto = n % 100, des = n % 10;
  const slovo = (sto > 10 && sto < 20) ? 'дней' : des === 1 ? 'день' : (des >= 2 && des <= 4) ? 'дня' : 'дней';
  return `${n} ${slovo}`;
}

function vRabote(o) { return !o.udalen && o.etap !== 'Сдан' && o.etap !== 'Отказ'; }

async function utrennyayaSvodka(env) {
  if (!env.BOT_TOKEN || !env.CHAT_ID || !env.OBYEKTY) return;

  const vse = await prochitat(env);
  const den = segodnyaMsk();

  const segodnya = vse.filter((o) => vRabote(o) && o.kogda === den);
  const prosrocheno = vse.filter((o) => vRabote(o) && o.kogda && o.kogda < den);

  /* Молчим, когда сказать нечего. Ежедневное «сегодня дел нет» за неделю
     превращается в сообщение, которое перестают открывать, — и вместе
     с ним перестают открывать нужные. */
  if (!segodnya.length && !prosrocheno.length) return;

  const stroka = (o) => {
    const hvost = [];
    if (o.chto) hvost.push(ekr(o.chto));
    if (o.tel) hvost.push(ekr(o.tel));
    const ost = (Number(o.summa) || 0) - (Number(o.avans) || 0);
    if (ost > 0 && Number(o.summa)) hvost.push(`остаток ${ost.toLocaleString('ru-RU')} ₽`);
    return `• <b>${ekr(o.imya || 'Без имени')}</b>${hvost.length ? ' — ' + hvost.join(', ') : ''}`;
  };

  const bloki = [`🔨 <b>План на ${poRusski(den)}</b>`];

  if (segodnya.length) bloki.push(['<b>Сегодня</b>', ...segodnya.map(stroka)].join('\n'));

  if (prosrocheno.length) {
    prosrocheno.sort((a, b) => (a.kogda < b.kogda ? -1 : 1));
    bloki.push(['⏰ <b>Просрочено</b>', ...prosrocheno.map(
      (o) => `${stroka(o)} <i>(${skolkoDney(dney(o.kogda, den))} назад)</i>`,
    )].join('\n'));
  }

  const vsego = vse.filter(vRabote);
  const zhdem = vsego.reduce((s, o) => s + ((Number(o.summa) || 0) - (Number(o.avans) || 0)), 0);
  bloki.push(`<i>Всего в работе ${vsego.length}, ждём получить ${zhdem.toLocaleString('ru-RU')} ₽</i>`);

  const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.CHAT_ID,
      text: bloki.join('\n\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  // Ответ Telegram наружу не отдаём: в тексте ошибки может оказаться токен.
  if (!tg.ok) console.log('telegram error', tg.status, await tg.text());
}

/* ===== Мелочи ===== */
function ravny(a, b) {
  if (a.length !== b.length) return false;
  let raznica = 0;
  for (let i = 0; i < a.length; i++) raznica |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return raznica === 0;
}

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
  const allow = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const ekr = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const otvet = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
