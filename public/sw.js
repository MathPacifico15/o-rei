// O jogo não mantém cache de código. Assim, uma atualização nunca reutiliza
// arquivos do servidor de desenvolvimento na versão jogável.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then(() => self.clients.claim()),
));

