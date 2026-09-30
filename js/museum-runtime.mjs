import { nodes, halls, legacyAliases } from './museum-catalog.mjs?v=20260930.3';
import { resolveRoute, ancestors, searchNodes, canUseScene, canCaptureEntry, escapeHTML as e } from './museum-core.mjs';
import { nodeLink } from './museum-render.mjs?v=20260930.3';
import { mountExhibit } from './museum-exhibits.mjs';
import { mountMotion } from './museum-motion.mjs?v=20260930.3';
import { mountConsole } from './museum-console.mjs?v=20260930.3';
import { mountGlobeControls } from './museum-globe-controls.mjs?v=20260930.3';

let disposePage;
function mount() {
  if (disposePage) return;
  const panels = [...document.querySelectorAll('[data-node]')];
  const directory = document.getElementById('museum-directory');
  const main = document.getElementById('main-content');
  if (!panels.length || !directory || !main) return;
  const routedNodes = [...nodes, { id: 'museum-directory', parent: 'lobby', title: '全馆目录' }];
  const sections = [...panels, directory];
  const search = document.getElementById('museum-search');
  const input = document.getElementById('museum-query');
  const tree = document.getElementById('museum-tree');
  const results = document.getElementById('museum-results');
  const status = document.getElementById('museum-search-status');
  const breadcrumbs = document.getElementById('museum-breadcrumbs');
  const share = document.getElementById('museum-share');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sceneMotion = mountMotion({ page: document, view: window, media: motion });
  const records = new Map(), demoStates = {};
  const capabilityConsole = mountConsole(document.querySelector('[data-capability-console]'), { document, window, onState: () => capture() });
  let current = null, exhibit = null, scene = null, scenePending = false, sceneFailed = false, disposed = false;
  let sceneLoad = null;
  let serial = 0, saveTimer, toastTimer, navigationFrame = 0, sceneAnimate = true;
  let animation = null, lenis = null, ticker = null;
  const removers = [];
  const oldRestoration = history.scrollRestoration;
  const globeControls = mountGlobeControls(document.getElementById('globe-controls'), { onChange: (mode, options) => { scene?.setMode(mode, options); capture(); } });
  history.scrollRestoration = 'manual';
  const listen = (target, type, handler, options) => { target.addEventListener(type, handler, options); removers.push(() => target.removeEventListener(type, handler, options)); };
  // 静态控件键不随路由切换变化，用于恢复返回位置。
  document.querySelectorAll('a,button,input,summary').forEach((el, i) => { el.dataset.focusKey = `control-${i}`; });
  const routeKey = route => `${route.id}?${route.query}`;
  function focusDescriptor() {
    const active = document.activeElement;
    return { key: active?.dataset.focusKey || '', choice: active?.dataset.choice || '', demo: current?.id || '' };
  }
  function capture(write = true) {
    if (!current) return;
    if (!canCaptureEntry(current.hash, location.hash)) return records.get(current.key);
    if (exhibit) demoStates[current.id] = exhibit.snapshot();
    const value = { key: current.key, hash: current.hash, route: routeKey(current), scrollY: window.scrollY, focus: focusDescriptor(), query: input.value,
      demos: { ...demoStates }, capability: capabilityConsole.snapshot(), globe: globeControls.snapshot(), open: [...tree.querySelectorAll('details')].map(el => el.open) };
    records.set(current.key, value);
    if (write) history.replaceState({ ...history.state, museum: value }, '', location.href);
    return value;
  }
  function toast(message) {
    clearTimeout(toastTimer); const box = document.getElementById('museum-toast'); box.textContent = message;
    toastTimer = setTimeout(() => { box.textContent = ''; }, 4200);
  }
  function showSearch(query) {
    const trimmed = query.trim();
    input.value = query;
    if (!trimmed) { results.innerHTML = ''; tree.hidden = false; status.textContent = ''; return; }
    const found = searchNodes(trimmed, nodes);
    tree.hidden = true;
    results.innerHTML = found.map(nodeLink).join('') || '<p class="empty-search">没有找到匹配内容。试试“事件”“版本”或“研判”。</p>';
    results.querySelectorAll('a').forEach((el, i) => { el.dataset.focusKey = `search-${i}`; });
    status.textContent = `找到 ${found.length} 个入口`;
  }
  async function ensureScene(hall, animate = true) {
    sceneAnimate = animate;
    scene?.select(hall, { animate });
    const depth = current?.id === 'museum-directory' ? 2 : ancestors(current?.id, nodes).length - 1;
    if (scene || scenePending || sceneFailed || !canUseScene(innerWidth, motion.matches, depth)) return;
    scenePending = true;
    const loading = new AbortController(); sceneLoad = loading;
    try {
      const { mountScene } = await import('./museum-scene.mjs?v=20260930.3');
      if (disposed || loading.signal.aborted) return;
      const mounted = await mountScene(document.getElementById('museum-canvas'), document.querySelector('.lobby-emblem'), null, {
        signal: loading.signal,
        mode: globeControls.snapshot().mode,
        onReady: () => { if (!disposed && !loading.signal.aborted) globeControls.setReady(true); },
        onFailure: () => { if (!loading.signal.aborted) { globeControls.setReady(false); sceneFailed = true; } },
      });
      if (sceneLoad !== loading) { mounted.dispose(); return; }
      const latestDepth = current?.id === 'museum-directory' ? 2 : ancestors(current?.id, nodes).length - 1;
      if (disposed || loading.signal.aborted || !canUseScene(innerWidth, motion.matches, latestDepth)) { mounted.dispose(); globeControls.setReady(false); }
      else { scene = mounted; scene.setMode(globeControls.snapshot().mode, { animate: false }); scene.select(ancestors(current.id, nodes)[1]?.id || null, { animate: sceneAnimate }); }
    } catch { if (!loading.signal.aborted) sceneFailed = true; } finally {
      if (sceneLoad === loading) { scenePending = false; sceneLoad = null; }
    }
  }
  function releaseScene() {
    sceneLoad?.abort(); sceneLoad = null; scenePending = false;
    scene?.dispose(); scene = null; globeControls.setReady(false);
  }
  function animatePanel(panel, useMotion) {
    animation?.kill();
    if (useMotion && !motion.matches && document.documentElement.dataset.motionEnabled !== 'false' && window.gsap) animation = window.gsap.fromTo(panel.querySelector('.node-heading') || panel.querySelector('.lobby-copy') || panel, { y: 6 }, { y: 0, duration: 0.22, ease: 'power2.out', clearProps: 'transform' });
  }
  function activate({ restore = false, focus = false, keyboard = false } = {}) {
    const route = resolveRoute(location.hash, routedNodes, legacyAliases);
    const stored = history.state?.museum;
    const validStored = stored?.route === routeKey(route) && stored?.hash === location.hash ? stored : null;
    const key = validStored?.key || `jj-${Date.now()}-${serial++}`;
    const saved = restore ? records.get(key) || validStored : null;
    exhibit?.dispose(); exhibit = null;
    if (saved?.demos) Object.assign(demoStates, saved.demos);
    current = { ...route, key, hash: location.hash };
    if (saved?.capability?.view) capabilityConsole.select(saved.capability.view, { animate: false });
    if (saved?.globe?.mode) { globeControls.select(saved.globe.mode); scene?.setMode(saved.globe.mode, { animate: false }); }
    const panel = sections.find(section => section.id === route.id);
    if (!panel) return;
    sections.forEach(section => { section.hidden = section !== panel; });
    const path = ancestors(route.id, routedNodes), depth = route.id === 'museum-directory' ? 2 : path.length - 1;
    document.body.dataset.depth = depth > 2 ? 'deep' : String(depth);
    document.body.dataset.view = route.id === 'museum-directory' ? 'directory' : route.id;
    if (depth > 1 && scenePending) releaseScene();
    breadcrumbs.innerHTML = path.map((node, i) => `${i ? '<span aria-hidden="true">/</span>' : ''}<a href="#${e(node.id)}" data-nav${i === path.length - 1 ? ' aria-current="page"' : ''}>${e(node.id === 'lobby' ? '中央大厅' : node.title)}</a>`).join('');
    const parent = path.at(-2)?.id || 'lobby';
    const up = document.getElementById('museum-up'); up.href = `#${parent}`; up.hidden = route.id === 'lobby';
    document.querySelectorAll('.header-halls a').forEach(link => { if ((link.dataset.sections || '').split(' ').includes(path[1]?.id || route.id)) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    document.title = route.id === 'lobby' ? '境鉴｜全球移民智能监测平台 · 全景数字展馆' : `${path.at(-1)?.title || '全馆目录'} · 境鉴数字展馆`;
    if (route.id === 'museum-directory') {
      showSearch(route.query || saved?.query || '');
      if (saved?.open) [...tree.querySelectorAll('details')].forEach((el, i) => { if (typeof saved.open[i] === 'boolean') el.open = saved.open[i]; });
    }
    const demo = panel.querySelector('[data-demo]');
    if (demo) exhibit = mountExhibit(demo.querySelector('[data-demo-host]'), demo.dataset.demo, demoStates[route.id], value => { demoStates[route.id] = value; capture(); });
    sceneMotion.select(panel, { restore: restore && !!saved, keyboard });
    if (depth <= 1) ensureScene(path[1]?.id || null, !restore && !keyboard);
    animation?.kill(); animatePanel(panel, !restore && !keyboard);
    cancelAnimationFrame(navigationFrame);
    navigationFrame = requestAnimationFrame(() => {
      if (disposed) return;
      const y = saved?.scrollY ?? 0;
      lenis?.scrollTo(y, { immediate: true, force: true }); window.scrollTo({ top: y, behavior: 'instant' });
      if (focus || restore) {
        let target;
        if (saved?.focus?.key) target = [...document.querySelectorAll('[data-focus-key]')].find(el => el.dataset.focusKey === saved.focus.key && !el.closest('[hidden]'));
        else if (saved?.focus?.choice) target = [...panel.querySelectorAll('[data-choice]')].find(el => el.dataset.choice === saved.focus.choice);
        (target || panel.querySelector('h1') || main).focus({ preventScroll: true });
      }
      capture(); lenis?.resize();
    });
    history.replaceState({ ...history.state, museum: { ...(saved || {}), key, hash: location.hash, route: routeKey(route) } }, '', location.href);
    if (route.unknown) toast('这个入口已调整，已返回中央大厅。可在全馆目录继续查找。');
  }
  function go(hash, { keyboard = false } = {}) {
    capture();
    if (location.hash === hash) { activate({ restore: true, focus: true }); return; }
    history.pushState({ museum: { key: `jj-${Date.now()}-${serial++}`, hash, route: routeKey(resolveRoute(hash, routedNodes, legacyAliases)) } }, '', hash);
    activate({ focus: true, keyboard });
  }
  listen(document, 'click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hash === '#main-content') { main.focus(); return; }
    go(link.hash, { keyboard: event.detail === 0 });
  });
  listen(search, 'submit', event => { event.preventDefault(); go(`#museum-directory${input.value.trim() ? '?q=' + encodeURIComponent(input.value.trim()) : ''}`, { keyboard: true }); });
  listen(document.getElementById('scene-motion-toggle'), 'click', () => {
    if (document.documentElement.dataset.motionEnabled === 'false') {
      animation?.progress(1); animation?.kill();
      scene?.select(ancestors(current.id, nodes)[1]?.id || null, { animate: false });
    }
  });
  listen(document, 'museum-motion-change', () => scene?.setRunning(document.documentElement.dataset.motionRunning === 'true'));
  let lastHistoryKey = '';
  function onHistory() {
    const key = `${location.hash}|${history.state?.museum?.key || ''}`;
    if (key === lastHistoryKey && current?.key === history.state?.museum?.key) return;
    capture(false); activate({ restore: true, focus: true });
    lastHistoryKey = `${location.hash}|${history.state?.museum?.key || ''}`;
  }
  listen(window, 'popstate', onHistory); listen(window, 'hashchange', onHistory);
  listen(window, 'scroll', () => { capture(false); clearTimeout(saveTimer); saveTimer = setTimeout(() => capture(), 90); }, { passive: true });
  listen(document, 'focusin', () => { capture(false); clearTimeout(saveTimer); saveTimer = setTimeout(() => capture(), 90); });
  listen(share, 'click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('已复制当前内容链接。'); }
    catch { toast('请复制浏览器地址栏，即可分享当前内容。'); }
  });
  share.hidden = false;
  // 唯一平滑滚动引擎为 Lenis；减少动态或触屏使用原生滚动。
  function setupScroll() {
    if (ticker) window.gsap?.ticker.remove(ticker); ticker = null; lenis?.destroy(); lenis = null;
    if (motion.matches || !matchMedia('(min-width: 961px) and (pointer: fine)').matches || !window.Lenis || !window.gsap) return;
    lenis = new window.Lenis({ lerp: 0.13, smoothWheel: true, syncTouch: false, anchors: false });
    ticker = time => { if (!document.hidden) lenis?.raf(time * 1000); }; window.gsap.ticker.add(ticker);
  }
  const visibility = () => { if (document.hidden) lenis?.stop(); else lenis?.start(); };
  listen(document, 'visibilitychange', visibility);
  listen(motion, 'change', () => { animation?.kill(); setupScroll(); releaseScene(); sceneFailed = false; if (!motion.matches) ensureScene(ancestors(current.id, nodes)[1]?.id || null); });
  listen(window, 'resize', () => {
    lenis?.resize();
    if (innerWidth <= 768) releaseScene();
    else if (current) ensureScene(ancestors(current.id, nodes)[1]?.id || null);
  });
  document.documentElement.classList.add('museum-enhanced');
  setupScroll(); activate({ restore: true, focus: !!location.hash });
  disposePage = () => {
    capture(); disposed = true; clearTimeout(saveTimer); clearTimeout(toastTimer); cancelAnimationFrame(navigationFrame);
    animation?.kill(); exhibit?.dispose(); releaseScene(); sceneMotion.dispose(); capabilityConsole.dispose(); globeControls.dispose();
    if (ticker) window.gsap?.ticker.remove(ticker); lenis?.destroy();
    removers.forEach(remove => remove()); history.scrollRestoration = oldRestoration; disposePage = null;
  };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
window.addEventListener('pagehide', () => disposePage?.());
window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
