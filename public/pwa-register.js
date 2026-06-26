if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {
      // Registro silencioso: la app sigue funcionando aunque el navegador no permita SW.
    });
  });
}
