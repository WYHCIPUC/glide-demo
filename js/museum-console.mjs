// 公开能力关系台只引用展馆目录，不读取内部运行数据。
const views = [
  { id: 'monitoring', title: '持续监测', source: 'monitoring', center: 'monitoring-overview', nodes: ['global-migration', 'country-monitoring', 'timeline-monitoring', 'webpage-monitoring'], positions: [[150, 100], [610, 100], [150, 320], [610, 320]], paths: ['M250 100H300L380 210', 'M510 100H460L380 210', 'M250 320H300L380 210', 'M510 320H460L380 210'] },
  { id: 'events', title: '事件关联', source: 'event-linking', nodes: ['article-reader', 'event-linking', 'event-dedup', 'evidence-trail'], positions: [[100, 210], [285, 210], [470, 210], [655, 210]], paths: ['M170 210H215', 'M355 210H400', 'M540 210H585'] },
  { id: 'analysis', title: '专题研判', source: 'practical-common', nodes: ['baseline-layer', 'realtime-layer', 'combined-layer', 'guangzhou-relevance'], positions: [[190, 100], [190, 320], [470, 210], [650, 210]], paths: ['M285 100H335L380 210', 'M285 320H335L380 210', 'M560 210H570'] },
];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderDiagram(view, index) {
  const list = view.nodes.map(id => index.get(id));
  const center = view.center ? index.get(view.center) : null;
  const nodeMarkup = list.map((node, i) => {
    const [x, y] = view.positions[i];
    const width = view.id === 'events' ? 140 : view.id === 'analysis' && i === 3 ? 160 : 190;
    return `<g class="console-map-node" transform="translate(${x} ${y})"><rect x="${-width / 2}" y="-32" width="${width}" height="64" rx="3"/><path class="console-node-notch" d="M${-width / 2} -16V-32H${-width / 2 + 17}"/><circle cy="-14" r="2"/><text y="11" text-anchor="middle">${escape(node.title)}</text></g>`;
  }).join('');
  const hub = center ? `<g class="console-map-hub" transform="translate(380 210)"><circle r="66"/><circle class="console-hub-inner" r="54"/><path d="M-12 -23H12M0 -35V-11M-5 -15H5"/><text y="13" text-anchor="middle">${escape(center.title)}</text></g>` : '';
  return `<svg class="console-diagram" data-console-diagram="${view.id}" viewBox="0 0 760 420" role="img" aria-labelledby="capability-diagram-${view.id}"><title id="capability-diagram-${view.id}">${escape(view.title)}：${list.map(node => escape(node.title)).join('、')}</title><g class="console-map-frame" aria-hidden="true"><path d="M12 32V12H32M728 12H748V32M12 388V408H32M728 408H748V388"/><path class="console-map-axis" d="M380 18V402M18 210H742"/><circle cx="380" cy="210" r="172"/><circle cx="380" cy="210" r="116"/></g><g class="console-map-links">${view.paths.map(path => `<path d="${path}"/>`).join('')}</g>${hub}${nodeMarkup}</svg>`;
}

export function renderConsole(nodes = []) {
  const index = new Map(nodes.map(node => [node.id, node]));
  // 缺少目录依据时不创造名称或悬空链接。
  const available = views.filter(view => [view.source, ...view.nodes, ...(view.center ? [view.center] : [])].every(id => index.has(id)));
  if (!available.length) return '';
  const first = available[0].id;
  return `<section class="capability-console" data-capability-console data-console-active="${first}" aria-labelledby="capability-console-title"><header class="console-heading"><div><span class="section-kicker">能力关系图</span><h2 id="capability-console-title">从发现变化，到形成判断</h2></div><div class="console-select" role="group" aria-label="能力观察视角">${available.map(view => `<button type="button" data-console-view="${view.id}" aria-pressed="${view.id === first}" aria-controls="capability-panel-${view.id}">${view.title}</button>`).join('')}</div></header><div class="console-panels">${available.map(view => `<section class="console-panel" id="capability-panel-${view.id}" data-console-panel="${view.id}" aria-labelledby="capability-label-${view.id}"><div class="console-map"><div class="console-map-register" aria-hidden="true"><span>境鉴 / 能力视图</span><span>${view.title}</span></div>${renderDiagram(view, index)}</div><div class="console-reading"><h3 id="capability-label-${view.id}">${view.title}</h3><p class="console-description">${escape(index.get(view.source).summary)}</p><nav aria-label="${view.title}相关入口"><ul>${view.nodes.map(id => `<li><a href="#${id}" data-console-node="${id}">${escape(index.get(id).title)}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul></nav></div></section>`).join('')}</div></section>`;
}

export function mountConsole(host, options = {}) {
  const document = options.document || host?.ownerDocument;
  const window = options.window || document?.defaultView;
  const root = host?.matches?.('[data-capability-console]') ? host : host?.querySelector?.('[data-capability-console]');
  const buttons = [...(root?.querySelectorAll('[data-console-view]') || [])];
  const panels = [...(root?.querySelectorAll('[data-console-panel]') || [])];
  const media = window?.matchMedia?.('(prefers-reduced-motion: reduce)');
  let active = root?.dataset.consoleActive || buttons[0]?.dataset.consoleView || 'monitoring';
  let disposed = false;
  let timer;
  const stopFeedback = () => {
    if (timer !== undefined) window?.clearTimeout(timer);
    timer = undefined;
    if (root) delete root.dataset.consoleChange;
  };
  const select = (view, { animate = true } = {}) => {
    if (disposed || !root || !buttons.some(button => button.dataset.consoleView === view)) return false;
    const changed = view !== active;
    active = view;
    stopFeedback();
    root.dataset.consoleActive = view;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.consoleView === view));
    for (const panel of panels) panel.hidden = panel.dataset.consolePanel !== view;
    if (changed && animate && !media?.matches && document.documentElement.dataset.motionEnabled !== 'false') {
      root.dataset.consoleChange = 'true';
      timer = window.setTimeout(stopFeedback, 600);
    }
    if (changed) options.onState?.({ view: active });
    return true;
  };
  const click = event => {
    const button = event.target.closest?.('[data-console-view]');
    if (button && root.contains(button)) { select(button.dataset.consoleView, { animate: event.detail !== 0 }); return; }
    const link = event.target.closest?.('a[data-console-node]');
    if (link && root.contains(link) && options.onNavigate && !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && !link.hasAttribute('download') && (!link.target || link.target === '_self')) {
      event.preventDefault();
      options.onNavigate(link.dataset.consoleNode);
    }
  };
  const preferenceChange = () => { if (media.matches) stopFeedback(); };
  root?.addEventListener('click', click);
  media?.addEventListener?.('change', preferenceChange);
  select(active, { animate: false });
  return {
    snapshot: () => ({ view: active }),
    select,
    dispose() {
      if (disposed) return;
      disposed = true;
      stopFeedback();
      root?.removeEventListener('click', click);
      media?.removeEventListener?.('change', preferenceChange);
    },
  };
}
