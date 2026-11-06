// Offline cache. Code (html/js) is network-first so updates arrive at once; heavy models, images and the 3D library are cache-first.
const V = 'lct-v1';
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return; // never cache saves or sign-in
  const heavy = /\/models\/|\/assets\/|\/icons\/|cdn\.jsdelivr\.net/.test(u.href);
  e.respondWith((async () => {
    const c = await caches.open(V);
    if (heavy) { const hit = await c.match(e.request); if (hit) return hit; const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
    try { const r = await fetch(e.request); if (r.ok && u.origin === location.origin) c.put(e.request, r.clone()); return r; }
    catch (err) { const hit = await c.match(e.request); if (hit) return hit; throw err; }
  })());
});
