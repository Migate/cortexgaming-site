// Moves the light in the dot-grid background to the pointer. Off when the visitor prefers reduced motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement, pending = 0;
  window.addEventListener('pointermove', function (e) {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
      pending = 0;
    });
  }, { passive: true });
})();
