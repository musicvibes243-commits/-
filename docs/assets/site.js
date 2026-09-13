/* Общий скрипт страниц услуг: отопление, электрика, автополив.

   Делает три вещи:
     1. Считает посещения и цели в Яндекс.Метрике (счётчик тот же, что на главной).
     2. Принимает заявку из формы и отправляет её в Telegram.
     3. Подставляет текущий год в подвал.

   На главной странице этот же код лежит внутри index.html — она
   самостоятельная и ни от чего не зависит. Меняете номер счётчика или
   адрес воркера — поменяйте в обоих местах. */

/* ---------- СТАТИСТИКА И ЦЕЛИ ---------- */
(function(){
  "use strict";
  var METRIKA = 112522751;   // счётчик «СтройИнвест», stroyinvest-mo.ru

  window.reachGoal = function(){};          // без счётчика цели молча игнорируются
  if (!METRIKA) return;

  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();
    for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");

  /* Вебвизор намеренно выключен: он записывает действия посетителя,
     включая то, что тот печатает в форме, а там телефоны живых людей. */
  ym(METRIKA,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});

  window.reachGoal = function(name){ try{ ym(METRIKA,'reachGoal',name); }catch(e){} };

  /* Обращения считаем по клику: звонок и мессенджеры */
  document.addEventListener('click', function(e){
    if (!e.target.closest) return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0)      window.reachGoal('phone_click');
    else if (h.indexOf('wa.me') > -1) window.reachGoal('whatsapp_click');
    else if (h.indexOf('t.me') > -1)  window.reachGoal('telegram_click');
  });
})();

/* ---------- ФОРМА ЗАЯВКИ ---------- */
(function(){
  "use strict";
  var form = document.getElementById('leadForm');
  var box  = document.getElementById('formSummary');
  var list = document.getElementById('formSummaryList');
  var submitBtn = document.getElementById('fSubmit');
  var tried = false;
  /* КУДА УХОДЯТ ЗАЯВКИ. Заполните две строки — и форма заработает.
     Инструкция по шагам: README.md рядом с этим файлом. */
  var DELIVERY = {
    formspree: '',            // на почту:   'https://formspree.io/f/xxxxxxxx'
    telegram:  'https://zayavki.damka9093.workers.dev',
    whatsapp:  '79153469728'  // запасной путь, если оба канала не ответили
  };

  var RULES = [
    { id:'fName',  err:'eName',  msg:'Напишите, как к вам обращаться',
      ok:function(el){ return el.value.trim().length >= 2; } },
    { id:'fPhone', err:'ePhone', msg:'Введите телефон — минимум 10 цифр',
      ok:function(el){ return (el.value.match(/\d/g) || []).length >= 10; } },
    { id:'fAgree', err:'eAgree', msg:'Отметьте согласие на обработку данных',
      ok:function(el){ return el.checked; } }
  ];

  function validate(){
    var bad = [];
    RULES.forEach(function(r){
      var el = document.getElementById(r.id);
      var good = r.ok(el);
      document.getElementById(r.err).textContent = good ? '' : r.msg;
      if (el.type !== 'checkbox') el.setAttribute('aria-invalid', good ? 'false' : 'true');
      if (!good) bad.push(r);
    });
    return bad;
  }

  function renderSummary(bad){
    if (!bad.length) { box.hidden = true; return; }
    list.textContent = '';
    bad.forEach(function(r){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + r.id; a.textContent = r.msg;
      a.addEventListener('click', function(e){ e.preventDefault(); document.getElementById(r.id).focus(); });
      li.appendChild(a); list.appendChild(li);
    });
    box.hidden = false;
  }

  RULES.forEach(function(r){
    var el = document.getElementById(r.id);
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', function(){
      if (tried) renderSummary(validate());
    });
  });

  function payload(){
    return {
      name:    document.getElementById('fName').value.trim(),
      phone:   document.getElementById('fPhone').value.trim(),
      place:   document.getElementById('fPlace').value.trim(),
      service: document.getElementById('fSvc').value,
      text:    document.getElementById('fText').value.trim(),
      _gotcha: document.getElementById('fSite').value,
      _subject:'Заявка с сайта: ' + document.getElementById('fName').value.trim() +
               ', ' + document.getElementById('fPhone').value.trim(),
      page:    location.href,
      sentAt:  new Date().toLocaleString('ru-RU')
    };
  }

  /* Formspree подставляет в письмо имена полей как есть, поэтому для почты
     ключи переводим на русский: письмо читается с телефона сразу, без
     расшифровки. Воркеру Telegram и WhatsApp это не нужно — там свой формат. */
  function forEmail(d){
    return {
      'Имя':               d.name,
      'Телефон':           d.phone,
      'Населённый пункт':  d.place || '—',
      'Задача':            d.service,
      'Подробности':       d.text || '—',
      'Отправлено':        d.sentAt,
      'Страница':          d.page,
      _gotcha:  d._gotcha,
      _subject: d._subject
    };
  }

  function sendTo(url, data){
    return fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return true;
    });
  }

  function waLink(d){
    var t = 'Здравствуйте! Заявка с сайта.\n' +
            'Имя: ' + d.name + '\nТелефон: ' + d.phone +
            (d.place ? '\nНаселённый пункт: ' + d.place : '') +
            '\nЗадача: ' + d.service +
            (d.text ? '\nПодробности: ' + d.text : '');
    return 'https://wa.me/' + DELIVERY.whatsapp + '?text=' + encodeURIComponent(t);
  }

  function replaceForm(html){
    form.innerHTML = html;
    var h = form.querySelector('h3');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }

  function showDone(name){
    if (window.reachGoal) window.reachGoal('form_submit');
    replaceForm(
      '<div class="done">' +
        '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>' +
        '<div><h3>Заявка принята</h3>' +
        '<p>' + name + ', спасибо! Перезвоним в течение 15 минут и согласуем день выезда.</p></div>' +
      '</div>'
    );
  }

  /* Заявка не должна теряться: если отправка не прошла — даём прямые способы связи */
  function showFail(data){
    replaceForm(
      '<div class="done fail">' +
        '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>' +
        '<div><h3>Заявка не ушла</h3>' +
          '<p>Связь с сервером прервалась — скорее всего, пропал интернет. Позвоните или напишите, примем заявку сразу:</p>' +
          '<p style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px">' +
            '<a class="btn btn--accent" href="tel:+79153469728">Позвонить</a>' +
            '<a class="btn btn--outline" href="' + waLink(data) + '" target="_blank" rel="noopener">Написать в WhatsApp</a>' +
          '</p>' +
        '</div>' +
      '</div>'
    );
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    tried = true;
    var bad = validate();
    renderSummary(bad);
    if (bad.length) { box.focus(); return; }

    var data = payload();
    var jobs = [];
    if (DELIVERY.formspree) jobs.push(sendTo(DELIVERY.formspree, forEmail(data)));
    if (DELIVERY.telegram)  jobs.push(sendTo(DELIVERY.telegram, data));

    if (!jobs.length) {                       // каналы ещё не настроены
      window.open(waLink(data), '_blank', 'noopener');
      showDone(data.name);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    Promise.allSettled(jobs).then(function(res){
      var ok = res.some(function(r){ return r.status === 'fulfilled'; });
      if (ok) showDone(data.name); else showFail(data);
    });
  });

  /* ---------- ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ ----------
     Классы вешает скрипт, поэтому без него всё видно сразу.
     При системной настройке «уменьшить движение» не включается вовсе. */
  (function(){
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var sets = ['.head', '.card', '.step', '.faq details',
                '#leadForm', '.contacts'];
    var watched = [];
    sets.forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(el, i){
        if (el.closest('.hero')) return;          // первый экран играет при загрузке
        el.classList.add('rv');
        el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
        watched.push(el);
      });
    });

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add('rv--in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });
    watched.forEach(function(el){ io.observe(el); });

    /* Страховка: если что-то не попало в наблюдатель, через 4 секунды показываем */
    setTimeout(function(){
      watched.forEach(function(el){ el.classList.add('rv--in'); });
    }, 4000);
  })();

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
