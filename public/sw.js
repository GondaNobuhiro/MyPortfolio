// Stub service worker — unregisters any stale SW on this origin
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister()
  );
});
