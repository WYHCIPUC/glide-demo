import { escapeHTML as e, dedupModel, scopeModel, scopeCSV, packageModel } from './museum-core.mjs';

function saveFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const controls = (items, selected) => `<div class="demo-controls" role="group" aria-label="选择演示状态">${items.map(([value, label]) => `<button type="button" data-choice="${e(value)}" aria-pressed="${selected === value}">${e(label)}</button>`).join('')}</div>`;
const metric = (value, title) => `<div><strong>${e(value)}</strong><span>${e(title)}</span></div>`;
let worldPromise;
function mapMarkup(world, records) {
  const project = ([lon, lat]) => [(lon + 180) * 680 / 360, (85 - Math.max(-80, lat)) * 315 / 165];
  const ring = coordinates => coordinates.map((point, i) => { const [x, y] = project(point); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ') + 'Z';
  const polygons = world.features.flatMap(f => f.geometry?.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry?.type === 'MultiPolygon' ? f.geometry.coordinates : []);
  const land = polygons.map(poly => `<path class="map-land" d="${poly.map(ring).join(' ')}" fill-rule="evenodd"/>`).join('');
  const countries = [...new Map(records.map(row => [row.country, row])).values()];
  const points = countries.map(row => { const [x, y] = project(row.coordinates); return `<circle class="map-point" cx="${x}" cy="${y}" r="4"><title>${e(row.country)}</title></circle>`; }).join('');
  return `<svg class="demo-scope-map" viewBox="0 0 680 315" role="img" aria-label="演示记录国别分布：${e(countries.map(row => row.country).join('、')) || '当前无记录'}">${land}${points}</svg>`;
}

export function mountExhibit(host, kind, initial = {}, onState = () => {}) {
  let state = { ...initial }, disposed = false, revision = 0;
  const defaults = { dedup: 'original', versions: 'compare', layers: 'synthesis', scope: 'all', package: 'baseline', themes: 'dark-workstation' };
  state.choice ||= defaults[kind];
  function draw() {
    const choice = state.choice;
    revision++;
    if (kind === 'dedup') {
      const m = dedupModel(choice === 'updated');
      host.innerHTML = `${controls([['original', '查看转载归并'], ['updated', '加入一次实质更新']], choice)}<div class="demo-publications"><span>原始发布 A</span><span>转载 B</span><span>改写标题 C</span>${choice === 'updated' ? '<span>实质更新 D</span>' : ''}</div><div class="demo-canonical"><strong>一条事实主记录</strong><small>${choice === 'updated' ? '版本 01 → 版本 02 · 关联原始依据' : '版本 01 · 来源引用保持完整'}</small></div><div class="demo-topics">${['涉外服务管理', '偷渡态势研判', '境外风险传导', '全球暴恐监测'].map(t => `<span>↗ ${t}</span>`).join('')}</div><div class="demo-metrics">${metric(m.publications, '输入发布')}${metric(m.records, '事实记录')}${metric(m.versions, '来源版本')}${metric(m.references, '专题引用')}</div><p>转载增加的是来源线索；内容实质更新时，记录连接到新版本。四个专题继续引用同一条事实。</p>`;
    } else if (kind === 'versions') {
      const before = `<article class="version-paper"><small>归档版本 01 / 示例通知</small><h3>服务窗口安排</h3><p>材料提交时间：<del>每周一、周三</del>。</p><p>咨询方式：现场咨询。</p></article>`;
      const after = `<article class="version-paper"><small>归档版本 02 / 示例通知</small><h3>服务窗口安排</h3><p>材料提交时间：<ins>每周一至周五</ins>。</p><p>咨询方式：现场咨询，<ins>新增在线预约</ins>。</p></article>`;
      host.innerHTML = `${controls([['compare', '前后对照'], ['before', '版本 01'], ['after', '版本 02']], choice)}<div class="version-comparison">${choice !== 'after' ? before : ''}${choice !== 'before' ? after : ''}</div><div class="version-source">示意通知 · 两份文本保留各自版本，不覆盖旧记录。</div>`;
    } else if (kind === 'layers') {
      const data = [{ id: 'baseline', title: '长期基线', input: '历史资料、国家背景', output: '理解平时是什么样，为当前变化提供背景。' }, { id: 'realtime', title: '实时变化', input: '新发布、更新与事件', output: '看到新出现的内容，并沿来源版本继续查阅。' }, { id: 'synthesis', title: '组合研判', input: '基线 + 变化 + 业务视角', output: '将当前变化放回长期背景，形成带资料依据的专题判断。' }];
      host.innerHTML = `${controls(data.map(row => [row.id, row.title]), choice)}<div class="demo-layer-stack">${data.map((row, i) => `<div class="demo-layer ${row.id === choice ? 'is-selected' : ''}"><span>资料层 ${i + 1}</span><strong>${row.title}</strong><small>${row.input}</small></div>`).join('')}</div><div class="demo-result">${data.find(row => row.id === choice)?.output || data[2].output}</div>`;
    } else if (kind === 'scope') {
      const model = scopeModel(choice);
      host.innerHTML = `${controls([['all', '全部地区'], ['欧洲', '欧洲'], ['亚洲', '亚洲'], ['美洲', '美洲']], choice)}<div class="demo-map-host"><p>正在准备国别地图…</p></div><div class="demo-chart">${model.bars.map(row => `<div class="demo-bar"><span>${e(row.name)}</span><i style="width:${row.value / Math.max(1, model.total) * 100}%"></i><span>${row.value}</span></div>`).join('')}</div><div class="demo-table-wrap" role="region" aria-label="演示记录，可横向滚动" tabindex="0"><table class="demo-table"><caption>当前范围 · ${model.total} 条演示记录</caption><thead><tr><th>编号</th><th>国家</th><th>类别</th><th>标题</th></tr></thead><tbody>${model.records.map(row => `<tr><td>${row.id}</td><td>${row.country}</td><td>${row.kind}</td><td>${row.title}</td></tr>`).join('')}</tbody></table></div><button type="button" class="demo-export" data-download="scope">下载当前 ${model.total} 条示例 CSV ↗</button>`;
      const current = revision;
      worldPromise ||= fetch('./data/world.json').then(response => { if (!response.ok) throw new Error('地图不可用'); return response.json(); }).catch(error => { worldPromise = null; throw error; });
      worldPromise.then(world => { if (!disposed && current === revision) host.querySelector('.demo-map-host').innerHTML = mapMarkup(world, model.records); }).catch(() => { if (!disposed && current === revision) host.querySelector('.demo-map-host').innerHTML = '<p>地图暂不可用，国别分布与明细仍可查看。</p>'; });
    } else if (kind === 'package') {
      const model = packageModel(choice);
      host.innerHTML = `${controls([['baseline', '全量基线包'], ['incremental', '增量更新包']], choice)}<div class="package-layout"><ul class="package-list">${model.files.map(file => `<li>${file}</li>`).join('')}</ul><pre class="package-manifest">${e(JSON.stringify(model, null, 2))}</pre></div><div class="demo-controls"><button type="button" data-digest>计算示例清单 SHA-256</button><button type="button" data-download="package">下载示例清单</button></div><div class="demo-digest" role="status">${e(state.digest || '')}</div><p>知识包通过人工介质或既有安全交换方式流转。这里仅展示公开示例清单。</p>`;
    } else if (kind === 'themes') {
      const modes = [['dark-workstation', '深色 · 工作站'], ['light-workstation', '浅色 · 工作站'], ['dark-classic', '深色 · 经典'], ['light-classic', '浅色 · 经典']];
      host.innerHTML = `${controls(modes, choice)}<div class="theme-specimen" data-theme="${e(choice)}"><div class="sample-top"><strong>境鉴</strong><span>全球移民动态</span></div><div class="sample-tabs"><span>事件数据</span><span>每日简报</span><span>月度研判</span></div><div class="sample-title">从信息变化，进入事件与依据。</div><div class="sample-columns"><div><strong>重点变化</strong><p>政策更新示例 A</p><p>查看摘要 → 阅读原文 → 关联事件</p></div><div><strong>阅读路径</strong><p>当前判断</p><p>来源与历史</p><p>相关资料</p></div></div></div><div class="specimen-note">界面结构示意 · 四种模式展示同一组内容。</div>`;
    }
  }
  const click = async event => {
    const button = event.target.closest('button');
    if (!button || !host.contains(button)) return;
    if (button.hasAttribute('data-choice')) {
      state.choice = button.dataset.choice; state.digest = ''; onState({ ...state }); draw();
      [...host.querySelectorAll('[data-choice]')].find(el => el.dataset.choice === state.choice)?.focus({ preventScroll: true });
    } else if (button.dataset.download === 'scope') saveFile('jingjian-demo-scope.csv', '\uFEFF' + scopeCSV(scopeModel(state.choice).records), 'text/csv;charset=utf-8');
    else if (button.dataset.download === 'package') saveFile('jingjian-demo-manifest.json', JSON.stringify(packageModel(state.choice), null, 2), 'application/json');
    else if (button.hasAttribute('data-digest')) {
      const current = revision;
      try {
        if (!globalThis.crypto?.subtle) throw new Error('当前环境不支持校验计算');
        const bytes = new TextEncoder().encode(JSON.stringify(packageModel(state.choice), null, 2));
        const hash = await crypto.subtle.digest('SHA-256', bytes);
        if (disposed || current !== revision) return;
        state.digest = [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
        host.querySelector('.demo-digest').textContent = state.digest; onState({ ...state });
      } catch { if (!disposed && current === revision) host.querySelector('.demo-digest').textContent = '当前环境无法计算校验值，仍可下载示例清单。'; }
    }
  };
  host.addEventListener('click', click); draw();
  return { snapshot: () => ({ ...state }), dispose: () => { disposed = true; revision++; host.removeEventListener('click', click); } };
}
