/* Чтобы «Объекты» открывались без интернета.
 *
 * Иконка на экране «Домой» сама по себе офлайн не спасает: телефон всё
 * равно идёт в сеть за страницей, и в поле без связи мастер увидит
 * «Не удаётся открыть». А замер записывают именно там, где связи нет.
 *
 * Этот файл — служебный работник браузера (service worker). Он кладёт
 * страницу в свой запас и отдаёт её, когда сети нет.
 *
 * Правило простое: СНАЧАЛА СЕТЬ, запас — только если сеть не ответила.
 * Наоборот делать нельзя: тогда правки, которые я пушу, не доедут
 * до телефона никогда, и человек будет месяцами сидеть на старой версии.
 *
 * ВАЖНО ПРО ОСТАЛЬНОЙ САЙТ. Работник стоит в корне и формально видит
 * все запросы сайта. Но трогает он ровно две вещи: саму страницу
 * «Объекты» и иконку. Всё прочее — главная, страницы услуг, квиз —
 * проходит мимо, как будто его нет. Так рекламный сайт не рискует
 * однажды показать посетителю вчерашнюю версию из запаса.
 */

var ZAPAS = "obyekty-v2";
var NASHE = ["obyekty.html", "obyekty.webmanifest",
             "apple-touch-icon.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(ZAPAS).then(function (c) { return c.addAll(NASHE); }).then(function () {
    return self.skipWaiting();   // новая версия заступает сразу, без закрытия вкладки
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (imena) {
    return Promise.all(imena.map(function (i) { return i === ZAPAS ? null : caches.delete(i); }));
  }).then(function () { return self.clients.claim(); }));
});

function nashe(url) {
  return NASHE.indexOf(url.pathname.replace(/^\//, "")) > -1;
}

self.addEventListener("fetch", function (e) {
  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (e.request.method !== "GET" || url.origin !== self.location.origin || !nashe(url)) return;

  e.respondWith(
    fetch(e.request).then(function (otvet) {
      /* Свежую страницу кладём в запас — именно её покажем в следующий
         раз в поле без связи. */
      if (otvet && otvet.ok) {
        var kopiya = otvet.clone();
        caches.open(ZAPAS).then(function (c) { c.put(e.request, kopiya); });
      }
      return otvet;
    }).catch(function () {
      return caches.match(e.request).then(function (iz_zapasa) {
        return iz_zapasa || caches.match("obyekty.html");
      });
    })
  );
});
