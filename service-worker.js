const CACHE_NAME = "behoerdenklar-v2";
const APP_SHELL_FILES = [
  "index.html",
  "landingpage.html",
  "impressum.html",
  "agb.html",
  "datenschutz.html",
  "manifest.json",
  "icon-blue.svg",
  "logo.svg",
  "server.py"
];

function isRedirectResponse(response) {
  return (
    response &&
    (response.redirected ||
      response.type === "opaqueredirect" ||
      (response.status >= 300 && response.status < 400))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isNavigate = event.request.mode === "navigate";

  event.respondWith(
    (async () => {
      // Navigation (e.g. / → /landingpage.html): always network so redirects are not cached/served from SW
      if (!isNavigate) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
      }

      try {
        const response = await fetch(event.request);
        if (
          !isNavigate &&
          response.ok &&
          !isRedirectResponse(response)
        ) {
          const clone = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, clone);
        }
        return response;
      } catch {
        const fallback = await caches.match("landingpage.html");
        return fallback || Response.error();
      }
    })()
  );
});
