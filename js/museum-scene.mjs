import { mountGlobe } from './museum-globe.mjs?v=20261001.1';
export const shouldMoveCamera = ({ animate = true, enabled = true, reduced = false }) => animate && enabled && !reduced;

// 球体内含城市及弧面，成功首帧后才换掉完整静态图；故障恢复原构图。
export async function mountScene(host, _emblem, _initialHall = null, {
  mode = 'earth', onReady = () => {}, onFailure = () => {}, signal,
  page = host?.ownerDocument, view = page?.defaultView, createGlobe = mountGlobe,
} = {}) {
  const idle = { select() {}, setMode() {}, setRunning() {}, dispose() {} };
  if (!host?.isConnected || !view || view.innerWidth <= 768 || view.matchMedia('(prefers-reduced-motion: reduce)').matches || signal?.aborted) return idle;
  const stage = host.closest('.museum-stage'), label = page.querySelector('.guangzhou-anchor');
  let globe, disposed = false, failed = false, globeReady = false, projection;
  let requested = page.documentElement.dataset.motionRunning === 'true';
  function reset() {
    stage?.removeAttribute('data-globe-ready');
    if (!label) return;
    label.hidden = false; label.removeAttribute('data-tracked');
    for (const property of ['--guangzhou-x', '--guangzhou-y', '--guangzhou-opacity']) label.style.removeProperty(property);
  }
  function projectCity(point = projection) {
    if (disposed || failed || !point) return;
    projection = point;
    if (!globeReady || !label) return;
    const frame = host.getBoundingClientRect(), parent = (label.offsetParent || label.parentElement).getBoundingClientRect();
    label.dataset.tracked = 'true';
    label.style.setProperty('--guangzhou-x', `${frame.left - parent.left + point.x}px`);
    label.style.setProperty('--guangzhou-y', `${frame.top - parent.top + point.y}px`);
    label.style.setProperty('--guangzhou-opacity', String(point.opacity));
    label.hidden = !point.visible || point.opacity < .2 || point.x < 70 || point.x > frame.width - 70 || point.y < 40 || point.y > frame.height - 80;
  }
  function syncRunning() { if (!disposed) globe?.setRunning(requested && page.activeElement !== label); }
  function ready() {
    if (!disposed && !failed && stage?.isConnected) {
      globeReady = true; stage.dataset.globeReady = 'true'; projectCity(); onReady();
    }
  }
  function dispose() {
    if (disposed) return;
    disposed = true; globe?.dispose(); reset(); signal?.removeEventListener('abort', dispose);
    label?.removeEventListener('focus', syncRunning); label?.removeEventListener('blur', syncRunning);
  }
  function failure(error) { if (disposed || failed) return; failed = true; dispose(); onFailure(error); }
  signal?.addEventListener('abort', dispose, { once: true });
  label?.addEventListener('focus', syncRunning); label?.addEventListener('blur', syncRunning);
  globe = await createGlobe(host, { mode, signal, page, view, onReady: ready, onCityProject: projectCity, onFailure: failure });
  if (disposed) { globe.dispose(); return idle; }
  syncRunning();
  return {
    select() { requested = page.documentElement.dataset.motionRunning === 'true'; syncRunning(); },
    setMode(next, options) { globe.setMode(next, options); },
    setRunning(value) { requested = !!value; syncRunning(); },
    dispose,
  };
}
