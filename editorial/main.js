/* «Аникор», редакционная версия — минимум интерактива. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* бегущая строка: дублируем содержимое, чтобы петля была бесшовной */
  var ticker = document.getElementById('ticker');
  if (ticker) ticker.innerHTML += ticker.innerHTML;

  /* шапка на скролле */
  var top = document.getElementById('top');
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      top.classList.toggle('is-stuck', (window.scrollY || 0) > 40);
      ticking = false;
    });
  }, { passive: true });

  /* меню */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    var setOpen = function (state) {
      burger.setAttribute('aria-expanded', String(state));
      drawer.classList.toggle('is-open', state);
      document.body.classList.toggle('is-locked', state);
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setOpen(false); burger.focus(); }
    });
  }

  /* активный раздел в шапке */
  var links = [].slice.call(document.querySelectorAll('.top__nav a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) map[el.id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        if (map[entry.target.id]) map[entry.target.id].classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* появление блоков */
  var items = [].slice.call(document.querySelectorAll('.rise'));
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || reduced.matches) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      entry.target.style.transitionDelay = Math.min(i * 80, 320) + 'ms';
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
  items.forEach(function (el) { io.observe(el); });
})();
