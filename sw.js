/* Простой offline-first cache для GitHub Pages / любого статического хостинга.
   Версионируйте CACHE при каждом заметном обновлении контента. */
var CACHE = "cn-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/main.css",
  "./assets/css/components.css",
  "./assets/js/app.js",
  "./assets/js/renderer.js",
  "./assets/js/search.js",
  "./assets/js/widgets/progress.js",
  "./assets/js/widgets/quiz.js",
  "./assets/js/widgets/flashcards.js",
  "./assets/js/widgets/osi.js",
  "./assets/js/widgets/ios-cli.js",
  "./assets/js/widgets/pinout.js",
  "./assets/js/pt/core.js",
  "./assets/js/pt/engine.js",
  "./assets/js/pt/ui.js",
  "./content/registry.js",
  "./content/theory.js",
  "./content/cheatsheet.js",
  "./content/questions.js",
  "./content/labs/lab1/meta.js",
  "./content/labs/lab1/theory.js",
  "./content/labs/lab1/tasks.js",
  "./content/labs/lab1/quiz.js",
  "./content/labs/lab1/flashcards.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* addAll падает целиком при одном 404 — кладём по одному */
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok && url.pathname.indexOf("/assets/") === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        /* офлайн и нет в кэше — пробуем index.html (SPA) */
        if (e.request.mode === "navigate") {
          return caches.match("./index.html");
        }
        return new Response("", { status: 504, statusText: "Offline" });
      });
    })
  );
});
