// 信号只作视觉增强，不模拟实时数据；静态正文始终可读。
export const shouldAnimate = s => !s.reduced && !s.paused && s.visible && s.inView && s.lobby;
export function mountMotion({ page = document, view = window, media = view.matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  const root = page.documentElement, stage = page.getElementById('museum-stage');
  const button = page.getElementById('scene-motion-toggle'), progress = page.getElementById('reading-progress');
  const state = { reduced: media.matches, paused: button?.getAttribute('aria-pressed') === 'true', visible: !page.hidden, inView: !view.IntersectionObserver, lobby: false };
  const removers = [], animations = new Set(), seen = new WeakSet();
  let disposed = false, panel, frame = 0, mutation, removeInput;
  const listen = (target, name, handler, options) => { target?.addEventListener(name, handler, options); removers.push(() => target?.removeEventListener(name, handler, options)); };
  const enabled = () => !disposed && !state.reduced && !state.paused && state.visible;
  const cancel = () => { animations.forEach(a => a.cancel()); animations.clear(); };
  function sync() {
    if (disposed) return;
    root.dataset.motionEnabled = String(enabled()); root.dataset.motionRunning = String(shouldAnimate(state));
    page.dispatchEvent(new view.Event('museum-motion-change'));
    if (!enabled()) cancel();
    if (button) {
      button.hidden = false; button.disabled = state.reduced;
      button.textContent = state.reduced ? '静态浏览' : state.paused ? '继续场景动效' : '暂停场景动效';
      button.setAttribute('aria-pressed', String(state.paused));
    }
  }
  function animate(elements, duration = 260, stagger = 30) {
    if (!enabled()) return;
    elements.slice(0, 8).forEach((el, i) => {
      if (!el?.animate) return;
      const a = el.animate([{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }], { duration, delay: i * stagger, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(a); a.finished.then(() => animations.delete(a), () => animations.delete(a));
    });
  }
  const visibility = view.IntersectionObserver && stage ? new view.IntersectionObserver(entries => { state.inView = entries.some(e => e.isIntersecting); sync(); }, { threshold: .08 }) : null;
  visibility?.observe(stage);
  const reveal = view.IntersectionObserver ? new view.IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seen.has(entry.target) || !enabled() || entry.target.closest('[hidden]')) continue;
      seen.add(entry.target); animate([...entry.target.querySelectorAll('h2,.node-link,.console-heading')], 380, 45);
    }
  }, { threshold: .12 }) : null;
  function updateProgress() {
    frame = 0;
    if (disposed || !progress || !panel || !state.visible) return;
    const range = Math.max(1, panel.offsetTop + panel.offsetHeight - view.innerHeight);
    progress.style.setProperty('--reading-progress', Math.max(0, Math.min(1, view.scrollY / range)).toFixed(4));
  }
  const requestProgress = () => { if (!frame && !disposed && state.visible) frame = view.requestAnimationFrame(updateProgress); };
  listen(button, 'click', () => { state.paused = !state.paused; sync(); });
  listen(media, 'change', () => { state.reduced = media.matches; sync(); });
  listen(page, 'visibilitychange', () => { state.visible = !page.hidden; sync(); if (!state.visible) { view.cancelAnimationFrame(frame); frame = 0; } else requestProgress(); });
  listen(view, 'scroll', requestProgress, { passive: true }); listen(view, 'resize', requestProgress, { passive: true }); sync();
  return {
    select(next, { restore = false, keyboard = false } = {}) {
      if (disposed) return;
      cancel(); mutation?.disconnect(); removeInput?.(); reveal?.disconnect();
      panel = next; state.lobby = panel?.id === 'lobby'; sync(); requestProgress();
      if (!panel) return;
      if (!restore && !keyboard) {
        animate([...panel.querySelectorAll(state.lobby ? '.hall-rail a,.evidence-path a' : '.topic-display a')], state.lobby ? 340 : 240, 35);
        for (const target of panel.querySelectorAll('.lobby-introduction,.capability-console,.node-children')) reveal?.observe(target);
      }
      const host = panel.querySelector('[data-demo-host]');
      if (host && view.MutationObserver) {
        let pointer = false;
        const click = event => { pointer = event.detail > 0; };
        host.addEventListener('click', click, true); removeInput = () => host.removeEventListener('click', click, true);
        mutation = new view.MutationObserver(() => { if (pointer) animate([...host.querySelectorAll('.demo-layer,.version-paper,.demo-canonical,.demo-result,.demo-bar,.package-layout,.theme-specimen')], 210, 20); pointer = false; });
        mutation.observe(host, { childList: true });
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true; cancel(); mutation?.disconnect(); removeInput?.(); reveal?.disconnect(); visibility?.disconnect(); view.cancelAnimationFrame(frame);
      removers.forEach(remove => remove()); delete root.dataset.motionEnabled; delete root.dataset.motionRunning; if (button) button.hidden = true;
    }
  };
}
