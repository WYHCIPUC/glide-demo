import { mountGlobe } from './museum-globe.mjs?v=20260930.4';
export const shouldMoveCamera = ({ animate = true, enabled = true, reduced = false }) => animate && enabled && !reduced;

// 首帧与前景同时就绪后才换掉完整静态图；故障恢复原获选构图。
export async function mountScene(host, _emblem, _initialHall = null, {
  mode = 'earth', onReady = () => {}, onFailure = () => {}, signal,
  page = host?.ownerDocument, view = page?.defaultView, createGlobe = mountGlobe,
} = {}) {
  const idle = { select() {}, setMode() {}, setRunning() {}, dispose() {} };
  if (!host?.isConnected || !view || view.innerWidth <= 768 || view.matchMedia('(prefers-reduced-motion: reduce)').matches || signal?.aborted) return idle;
  const stage = host.closest('.museum-stage'), foreground = stage?.querySelector('.scene-foreground');
  let globe, disposed = false, failed = false, globeReady = false, foregroundReady = false;
  function reset() { stage?.removeAttribute('data-globe-ready'); if (foreground) foreground.hidden = true; }
  function ready() {
    if (!disposed && !failed && globeReady && foregroundReady && stage?.isConnected) {
      stage.dataset.globeReady = 'true'; foreground.hidden = false; onReady();
    }
  }
  function dispose() { if (disposed) return; disposed = true; globe?.dispose(); reset(); signal?.removeEventListener('abort', dispose); }
  function failure(error) { if (disposed || failed) return; failed = true; dispose(); onFailure(error); }
  signal?.addEventListener('abort', dispose, { once: true });
  if (!foreground) { failure(new Error('缺少地球前景层。')); return idle; }
  // 前景解码独立完成，不能阻塞路由/页面离开时取得清理句柄。
  Promise.resolve().then(() => foreground.decode()).then(() => { foregroundReady = true; ready(); }, failure);
  globe = await createGlobe(host, { mode, signal, page, view, onReady: () => { globeReady = true; ready(); }, onFailure: failure });
  if (disposed) { globe.dispose(); return idle; }
  globe.setRunning(page.documentElement.dataset.motionRunning === 'true');
  return {
    select() { globe.setRunning(page.documentElement.dataset.motionRunning === 'true'); },
    setMode(next, options) { globe.setMode(next, options); },
    setRunning(value) { globe.setRunning(value); },
    dispose,
  };
}
