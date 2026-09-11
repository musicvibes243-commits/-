/* Студия йоги «Аникор» — интерактив демо-сайта.
   Ванильный JS, без зависимостей. Всё, что анимируется,
   уважает prefers-reduced-motion. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Видеофон первого экрана ----------
     Положите ролик студии в assets/video/hero.mp4 и впишите путь ниже.
     Фото зала работает постером, пока видео грузится, и остаётся
     запасным вариантом, если браузер его не проиграет. */
  var HERO_VIDEO = '';

  (function heroVideo() {
    var box = document.getElementById('heroBg');
    if (!box || !HERO_VIDEO || reduced.matches) return;

    var video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';
    video.poster = 'assets/img/studio-hall.jpg';
    video.src = HERO_VIDEO;

    var drop = function () { if (video.parentNode) video.parentNode.removeChild(video); };
    video.addEventListener('error', drop);

    box.insertBefore(video, box.querySelector('.hero__veil'));
    var started = video.play();
    if (started && started.catch) started.catch(drop);
  })();

  /* ---------- Тема ---------- */
  (function theme() {
    var btn = $('#themeToggle');
    if (!btn) return;
    var root = document.documentElement;
    var sync = function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#12160F' : '#F7F4EE');
    };
    sync();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('anikor-theme', next); } catch (e) {}
      sync();
    });
  })();

  /* ---------- Мобильное меню ---------- */
  (function nav() {
    var toggle = $('#navToggle'), panel = $('#nav'), scrim = $('#navScrim');
    if (!toggle || !panel) return;
    var open = function (state) {
      toggle.setAttribute('aria-expanded', String(state));
      panel.classList.toggle('is-open', state);
      document.body.classList.toggle('is-locked', state);
      if (scrim) scrim.hidden = !state;
    };
    toggle.addEventListener('click', function () {
      open(toggle.getAttribute('aria-expanded') !== 'true');
    });
    if (scrim) scrim.addEventListener('click', function () { open(false); });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) open(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        open(false); toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1160) open(false);
    });
  })();

  /* ---------- Шапка при скролле + плавающая кнопка ---------- */
  (function onScroll() {
    var header = $('#header'), fab = $('.fab'), ticking = false;
    var update = function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 40);
      if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Подсветка активного пункта меню ---------- */
  (function scrollSpy() {
    var links = $$('.nav__list a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) map[el.id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        var link = map[entry.target.id];
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* ---------- Появление блоков ---------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduced.matches) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Мандала: лепестки ---------- */
  (function mandala() {
    var g = $('.petals');
    if (!g) return;
    var ns = 'http://www.w3.org/2000/svg', petals = 12;
    for (var i = 0; i < petals; i++) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M200 16c17 25 17 51 0 74-17-23-17-49 0-74z');
      path.setAttribute('transform', 'rotate(' + (i * (360 / petals)) + ' 200 200)');
      g.appendChild(path);
    }
  })();

  /* ---------- Форма записи (демо) ---------- */
  (function form() {
    var form = $('#bookingForm');
    if (!form) return;
    var status = $('#formStatus');
    var submit = $('#submitBtn');

    var showError = function (input, message) {
      var wrap = input.closest('.field');
      var box = wrap ? $('.field__error', wrap) : null;
      if (wrap) wrap.classList.toggle('field--error', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (box) { box.textContent = message || ''; box.hidden = !message; }
    };

    var digits = function (value) { return (value || '').replace(/\D/g, ''); };

    var STRINGS = {
      ru: {
        name: 'Напишите, как к вам обращаться',
        nameShort: 'Слишком короткое имя',
        phone: 'Без телефона мы не сможем перезвонить',
        phoneFormat: 'Проверьте номер: нужно 10–11 цифр',
        agree: 'Без согласия мы не можем принять заявку',
        invalid: 'Проверьте отмеченные поля — что-то заполнено не до конца.',
        sending: 'Отправляем…',
        sent: 'Готово! Это демо-версия, поэтому заявка не ушла. Для настоящей записи напишите в WhatsApp: +7 (916) 030-44-36.'
      },
      en: {
        name: 'Tell us what to call you',
        nameShort: 'That name looks too short',
        phone: 'Without a phone number we cannot call you back',
        phoneFormat: 'Check the number: 10–11 digits',
        agree: 'We need your consent to accept the request',
        invalid: 'Check the highlighted fields — something is missing.',
        sending: 'Sending…',
        sent: 'Done! This is a demo, so nothing was sent. To book for real, message us on WhatsApp: +7 (916) 030-44-36.'
      }
    };
    var t = STRINGS[(document.documentElement.lang || 'ru').slice(0, 2)] || STRINGS.ru;

    var check = function (input) {
      var value = input.type === 'checkbox' ? input.checked : input.value.trim();
      if (input.id === 'name') {
        if (!value) return t.name;
        if (value.length < 2) return t.nameShort;
      }
      if (input.id === 'phone') {
        if (!value) return t.phone;
        var d = digits(value);
        if (d.length < 10 || d.length > 12) return t.phoneFormat;
      }
      if (input.id === 'agree' && !value) return t.agree;
      return '';
    };

    var fields = ['#name', '#phone', '#agree'].map(function (sel) { return $(sel, form); }).filter(Boolean);

    fields.forEach(function (input) {
      var event = input.type === 'checkbox' ? 'change' : 'blur';
      input.addEventListener(event, function () { showError(input, check(input)); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('field--error')) showError(input, check(input));
      });
    });

    // мягкое форматирование телефона
    var phone = $('#phone', form);
    if (phone) {
      phone.addEventListener('input', function () {
        var d = digits(phone.value);
        if (!d) { phone.value = ''; return; }
        if (d[0] === '8') d = '7' + d.slice(1);
        if (d[0] !== '7') d = '7' + d;
        d = d.slice(0, 11);
        var out = '+7';
        if (d.length > 1) out += ' (' + d.slice(1, 4);
        if (d.length >= 5) out += ') ' + d.slice(4, 7);
        if (d.length >= 8) out += '-' + d.slice(7, 9);
        if (d.length >= 10) out += '-' + d.slice(9, 11);
        phone.value = out;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (input) {
        var message = check(input);
        showError(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        status.textContent = t.invalid;
        status.className = 'form__status is-error';
        firstInvalid.focus();
        return;
      }

      submit.disabled = true;
      status.textContent = t.sending;
      status.className = 'form__status';

      window.setTimeout(function () {
        submit.disabled = false;
        status.textContent = t.sent;
        status.className = 'form__status is-success';
        form.reset();
        fields.forEach(function (input) { showError(input, ''); });
      }, 700);
    });
  })();
})();
