// Runs in the document head, before the homepage can be painted. The default
// without JavaScript is the usable homepage, not a permanent loading screen.
export const introBootstrap = `(() => {
  const root = document.documentElement;
  let seen = false;
  try { seen = sessionStorage.getItem('telerad-monolith-intro') === 'seen'; } catch {}
  if (seen || location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.dataset.intro = 'pending';
  function cleanup() {
    clearTimeout(timeout);
    document.removeEventListener('click', skip, true);
    document.removeEventListener('keydown', escape, true);
    window.removeEventListener('telerad:intro-ready', cleanup);
  }
  function release(reason) {
    if (root.dataset.intro === 'pending') root.dataset.intro = reason;
    if (reason === 'skipped') {
      try { sessionStorage.setItem('telerad-monolith-intro', 'seen'); } catch {}
    }
    cleanup();
  }
  function skip(event) {
    if (root.dataset.intro === 'pending' && event.target.closest?.('.skip-intro')) {
      event.preventDefault();
      release('skipped');
    }
  }
  function escape(event) {
    if (root.dataset.intro === 'pending' && event.key === 'Escape') {
      event.preventDefault();
      release('skipped');
    }
  }
  const timeout = setTimeout(() => release('expired'), 6000);
  document.addEventListener('click', skip, true);
  document.addEventListener('keydown', escape, true);
  window.addEventListener('telerad:intro-ready', cleanup);
})();`;

// Inline with the bootstrap so the gate does not wait for external CSS.
export const introFirstPaintCss = `
html[data-intro="pending"] { background: #05080c; }
html[data-intro="pending"] .monolith > :not(.entrance) { visibility: hidden !important; }
html[data-intro="pending"] .entrance {
  display: grid; place-items: center; position: fixed; inset: 0;
  width: 100%; height: 100%; max-width: none; max-height: none;
  margin: 0; padding: 0; border: 0; background: #05080c; color: #f0f7fa;
  z-index: 1000; visibility: visible;
}
html[data-intro="pending"] .entrance *, .entrance[open] * {
  animation-play-state: running !important;
}
`;
