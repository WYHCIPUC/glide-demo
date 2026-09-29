import { escapeHTML as e, ancestors } from './museum-core.mjs';

export function nodeLink(node, index = null) {
  return `<a class="node-link" href="#${e(node.id)}" data-nav><span class="node-number">${index == null ? '↗' : String(index + 1).padStart(2, '0')}</span><span><strong>${e(node.title)}</strong><small>${e(node.summary || '')}</small></span><span class="node-arrow" aria-hidden="true">↗</span></a>`;
}

// 专题展台只是业务阅读路径，链接指向同一目录，不另造统计和事实。
function renderTopicDisplay(id) {
  const link = (target, label, caption) => `<a href="#${target}" data-nav><span>${e(caption)}</span><strong>${e(label)}</strong><i aria-hidden="true">↗</i></a>`;
  const displays = {
    'topic-foreign-service': ['city-index', '城市资源索引墙', `<div class="city-index-heading"><span>广州 / 服务准备</span><strong>人、机构与城市，<br>放在一起理解。</strong></div><div class="city-index-cells">${link('foreign-exhibition', '会展窗口', '01 / 时间')}${link('foreign-coverage', '涉外资源', '02 / 空间')}${link('enterprise-scope-analysis', '企业资料', '03 / 产业')}${link('foreign-sources', '名录依据', '04 / 来源')}</div>`],
    'topic-smuggling': ['route-table', '迁移路线分析台', `<div class="route-table-heading"><span>迁移走廊 / 阅读路径</span><strong>先看变化，再沿路线回到依据。</strong></div><div class="route-table-track">${link('smuggling-change', '时间变化', '01')}${link('smuggling-routes', '全球路线', '02')}${link('smuggling-impact', '结构与后果', '03')}</div><div class="route-table-ledger">${link('smuggling-sources', '来源与口径', '核对依据')}${link('smuggling-detail', '数据明细', '继续下钻')}</div>`],
    'topic-overseas-risk': ['risk-lens', '风险关联透视屏', `<div class="risk-lens-grid">${link('risk-change', '境外变化', '观察层 / 事件与时间')}${link('risk-countries', '国家背景', '背景层 / 国家与资料')}${link('risk-guangzhou', '广州关联', '分析层 / 往来与服务')}</div><div class="risk-lens-base"><strong>关联不是结论的终点。</strong><span>沿证据继续查证，让判断可以被追问。</span><a href="#risk-evidence" data-nav>进入证据与缺口 ↗</a></div>`],
    'topic-terrorism': ['evidence-wall', '时空证据墙', `<div class="evidence-wall-lead"><span>时间 × 地点 × 来源</span><strong>一条事件，<br>不止一种读法。</strong></div><div class="evidence-wall-rows">${link('terror-change', '事件如何变化', '时间')}${link('terror-map', '发生在什么地方', '空间')}${link('terror-groups', '归因来自何处', '关联')}${link('terror-sources', '哪些材料支持判断', '证据')}</div>`]
  };
  const display = displays[id];
  if (!display) return '';
  return `<nav class="topic-display" data-topic-display="${display[0]}" aria-label="${display[1]}"><div class="topic-display-caption"><span>${display[1]}</span><span>选择一个视角，继续深入</span></div>${display[2]}</nav>`;
}

export function renderNode(node, nodes, halls, aliases) {
  if (node.id === 'lobby') return '';
  const path = ancestors(node.id, nodes), hall = halls.find(h => h.id === path[1]?.id);
  const children = nodes.filter(item => item.parent === node.id);
  const isHall = node.parent === 'lobby';
  const paragraphs = node.paragraphs || [], bullets = node.bullets || [], steps = node.steps || [];
  const aliasHTML = Object.entries(aliases).filter(([key, target]) => target === node.id && key !== node.id && !nodes.some(n => n.id === key)).map(([key]) => `<span id="${e(key)}" class="legacy-anchor" aria-hidden="true"></span>`).join('');
  return `<section id="${e(node.id)}" class="museum-node ${isHall ? 'hall-node' : 'detail-node'}" data-node data-hall="${e(hall?.id || '')}" data-depth="${path.length - 1}" aria-labelledby="title-${e(node.id)}">
  ${aliasHTML}<header class="node-heading"><div class="node-register"><span>${e(hall?.index || 'JJ')} / ${isHall ? '主题展馆' : `深度 ${path.length - 1}`}</span><span>${e(isHall ? hall?.kicker : hall?.title)}</span></div>
  <h1 id="title-${e(node.id)}" tabindex="-1">${e(node.title)}</h1><p class="node-summary">${e(node.summary)}</p>${isHall ? `<span class="hall-numeral" aria-hidden="true">${e(hall?.index)}</span>` : ''}</header>
  ${renderTopicDisplay(node.id)}
  <div class="reading-layout"><div class="reading-main">${paragraphs.map(p => `<p>${e(p)}</p>`).join('')}
  ${bullets.length ? `<ul class="reading-points">${bullets.map(b => `<li>${e(b)}</li>`).join('')}</ul>` : ''}
  ${steps.length ? `<ol class="reading-steps">${steps.map((step, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><p>${e(step)}</p></li>`).join('')}</ol>` : ''}
  ${node.demo ? `<section class="interactive-exhibit" data-demo="${e(node.demo)}" aria-label="${e(node.title)}交互演示"><div class="exhibit-caption"><span>可操作展项</span><span>演示数据</span></div><div data-demo-host><p>本展项演示${e(node.summary)}。启用脚本后可操作；上方正文与下方设计说明可直接阅读。</p></div></section>` : ''}
  ${children.length ? `<nav class="node-children" aria-label="${e(node.title)}下级内容"><div class="section-caption">${isHall ? '选择一个展项，继续探索' : '进一步了解'}<span>${children.length} 个入口</span></div>${children.map(nodeLink).join('')}</nav>` : ''}
  </div><aside class="reading-aside"><p class="aside-label">在这个展馆里</p><nav aria-label="相关内容">${(node.related || []).map(id => nodes.find(n => n.id === id)).filter(Boolean).map(n => `<a href="#${e(n.id)}" data-nav>${e(n.title)}<span aria-hidden="true">↗</span></a>`).join('') || `<a href="#${e(hall?.id || 'lobby')}" data-nav>返回${e(hall?.title || '中央大厅')}<span aria-hidden="true">↗</span></a>`}</nav>
  <div class="reading-trace"><span>当前路径</span>${path.map(n => `<a href="#${e(n.id)}" data-nav>${e(n.title)}</a>`).join('')}</div>
  ${node.sourceRefs?.length ? `<details class="source-details"><summary>实现参考</summary><ul>${node.sourceRefs.map(ref => `<li>${e(typeof ref === 'string' ? ref : JSON.stringify(ref))}</li>`).join('')}</ul></details>` : ''}
  </aside></div></section>`;
}

export function renderDirectory(nodes, halls) {
  return halls.map(h => `<details class="directory-hall" open><summary><span>${h.index}</span>${e(h.title)}</summary><ul>${nodes.filter(n => ancestors(n.id, nodes)[1]?.id === h.id && n.id !== h.id).map(n => `<li style="--tree-depth:${Math.max(0, ancestors(n.id, nodes).length - 3)}"><a href="#${e(n.id)}" data-nav>${e(n.title)}</a></li>`).join('')}</ul></details>`).join('');
}
