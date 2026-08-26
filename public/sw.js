// Nukhba School SaaS - Offline-First Service Worker (Multi-Day Reliable)
// App Shell + Stale-While-Revalidate Architecture + Full Route Pre-Caching
const CACHE_NAME = "nukhba-pwa-v7";
const APP_SHELL_CACHE = "nukhba-shell-v7";

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon.svg",
];

// Admin routes that must work offline for days/weeks
const OFFLINE_ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/students",
  "/admin/attendance",
  "/admin/grades",
  "/admin/payments",
  "/admin/teachers",
  "/admin/schedule",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(() => {});
      }),
      caches.open(APP_SHELL_CACHE).then((cache) => {
        return Promise.all(
          OFFLINE_ADMIN_ROUTES.map((route) =>
            fetch(route)
              .then((res) => {
                if (res && res.status === 200) {
                  return cache.put(route, res);
                }
              })
              .catch(() => {})
          )
        );
      }),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== APP_SHELL_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle explicit message to pre-cache all routes on demand
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRECACHE_ALL_ROUTES") {
    event.waitUntil(
      caches.open(APP_SHELL_CACHE).then((cache) => {
        return Promise.all(
          OFFLINE_ADMIN_ROUTES.map((route) =>
            fetch(route)
              .then((res) => {
                if (res && res.status === 200) {
                  return cache.put(route, res);
                }
              })
              .catch(() => {})
          )
        );
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests (Server Actions, form submissions)
  if (event.request.method !== "GET") return;

  // --- Strategy 1: Navigation requests to admin routes ---
  // Network-first with cached fallback for the full page HTML
  if (event.request.mode === "navigate") {
    const isOfflineRoute = OFFLINE_ADMIN_ROUTES.some(
      (route) => url.pathname === route || url.pathname.startsWith(route + "/")
    );

    if (isOfflineRoute || url.pathname.startsWith("/admin")) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Cache successful navigation responses for offline use
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(APP_SHELL_CACHE).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(async () => {
            // Offline: try exact URL match first
            const cachedExact = await caches.match(event.request);
            if (cachedExact) return cachedExact;

            // Offline: try pathname match in APP_SHELL_CACHE
            const shellCache = await caches.open(APP_SHELL_CACHE);
            const cachedPath = await shellCache.match(url.pathname);
            if (cachedPath) return cachedPath;

            // Fallback: try to serve any cached admin page
            const keys = await shellCache.keys();
            if (keys.length > 0) {
              const fallback = await shellCache.match(keys[0]);
              if (fallback) return fallback;
            }

            // Last resort: offline standby page
            return new Response(
              `<!DOCTYPE html>
              <html dir="rtl" lang="ar">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>منظومة النخبة - وضع أوفلاين</title>
                <style>
                  body { font-family: 'Cairo', sans-serif; display: flex; align-items: center;
                    justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc;
                    color: #1e293b; text-align: center; }
                  .box { padding: 3rem; max-width: 420px; background: white; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                  h2 { font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; color: #0f172a; }
                  p { color: #64748b; margin-bottom: 2rem; line-height: 1.8; font-size: 14px; }
                  button { background: #059669; color: white; border: none; padding: 12px 32px;
                    border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; }
                  button:hover { background: #047857; }
                </style>
              </head>
              <body>
                <div class="box">
                  <h2>📡 لا يوجد اتصال بالإنترنت</h2>
                  <p>يرجى فتح النظام مرة واحدة أثناء الاتصال بالإنترنت والضغط على "تجهيز الجهاز للعمل بدون إنترنت" لضمان تخزين كافة الصفحات محلياً.</p>
                  <button onclick="location.reload()">إعادة المحاولة</button>
                </div>
              </body>
              </html>`,
              {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              }
            );
          })
      );
      return;
    }

    return;
  }

  // --- Strategy 2: Next.js static chunks and assets ---
  // Stale-While-Revalidate for JS, CSS, images, fonts
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|css|js)$/i);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // --- Strategy 3: Next.js RSC data requests ---
  if (url.pathname.startsWith("/_next/data/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || new Response("{}", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }
});
