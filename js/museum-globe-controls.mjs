// 形态选择是画面偏好，不代表业务状态或实时数据。
const modes = new Set(['earth', 'grid', 'network']);
export function mountGlobeControls(host, { onChange = () => {} } = {}) {
  let mode = 'earth', ready = false, disposed = false;
  const buttons = [...(host?.querySelectorAll('[data-globe-mode]') || [])];
  function select(next) {
    if (disposed) return;
    mode = modes.has(next) ? next : 'earth';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.globeMode === mode)));
  }
  const handlers = buttons.map(button => {
    const handler = event => {
      if (!ready || disposed || mode === button.dataset.globeMode) return;
      select(button.dataset.globeMode); onChange(mode, { animate: event.detail > 0 });
    };
    button.addEventListener('click', handler); return [button, handler];
  });
  function setReady(value) { ready = !!value; if (host) host.hidden = !ready; }
  select(mode); setReady(false);
  return { select, setReady, snapshot: () => ({ mode }), dispose() {
    if (disposed) return;
    disposed = true; handlers.forEach(([button, handler]) => button.removeEventListener('click', handler)); setReady(false);
  } };
}
