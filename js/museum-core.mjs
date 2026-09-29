// 公开展馆的路由与演示模型。不读取业务系统，不写入业务数据。
export const canUseScene = (width, reduced, depth) => width > 768 && !reduced && depth <= 1;
// 原生片段跳转发生后，不能再把目标页的滚动位置写进离开的条目。
export const canCaptureEntry = (activeHash, nextHash) => activeHash === nextHash;

export function resolveRoute(hash, nodes, aliases = {}) {
  const [raw, query = ''] = String(hash || '').replace(/^#/, '').split('?');
  let key;
  try { key = decodeURIComponent(raw) || 'lobby'; } catch { key = 'lobby'; }
  key = aliases[key] || key;
  const found = nodes.some(node => node.id === key);
  return { id: found ? key : 'lobby', query: new URLSearchParams(query).get('q') || '', unknown: !found };
}

export function ancestors(id, nodes) {
  const index = new Map(nodes.map(node => [node.id, node]));
  const path = [], seen = new Set();
  let node = index.get(id);
  while (node && !seen.has(node.id)) {
    path.unshift(node); seen.add(node.id); node = index.get(node.parent);
  }
  return path;
}

export function searchNodes(query, nodes) {
  const words = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return nodes.filter(node => node.parent === 'lobby');
  return nodes.filter(node => {
    const text = [node.title, node.summary, ...(node.paragraphs || []), ...(node.bullets || []), ...(node.steps || [])].join(' ').toLocaleLowerCase();
    return words.every(word => text.includes(word));
  }).sort((a, b) => Number(b.title.toLocaleLowerCase().includes(words[0])) - Number(a.title.toLocaleLowerCase().includes(words[0])));
}

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const dedupModel = updated => ({ publications: updated ? 4 : 3, records: 1, versions: updated ? 2 : 1, references: 4 });

// 明确为交互演示数据，地理坐标仅用于公开国别定位。
export const demoRecords = Object.freeze([
  { id: 'S01', country: '法国', region: '欧洲', kind: '政策', title: '政策变化示例 A', coordinates: [2.35, 48.85] },
  { id: 'S02', country: '德国', region: '欧洲', kind: '事件', title: '公开事件示例 B', coordinates: [13.40, 52.52] },
  { id: 'S03', country: '法国', region: '欧洲', kind: '资料', title: '来源更新示例 C', coordinates: [2.35, 48.85] },
  { id: 'S04', country: '日本', region: '亚洲', kind: '政策', title: '政策变化示例 D', coordinates: [139.69, 35.69] },
  { id: 'S05', country: '泰国', region: '亚洲', kind: '资料', title: '来源更新示例 E', coordinates: [100.50, 13.75] },
  { id: 'S06', country: '美国', region: '美洲', kind: '事件', title: '公开事件示例 F', coordinates: [-77.04, 38.91] },
  { id: 'S07', country: '加拿大', region: '美洲', kind: '政策', title: '政策变化示例 G', coordinates: [-75.70, 45.42] }
]);

export function scopeModel(region = 'all') {
  const records = demoRecords.filter(row => region === 'all' || row.region === region);
  const counts = new Map();
  for (const row of records) counts.set(row.country, (counts.get(row.country) || 0) + 1);
  return { records, total: records.length, bars: [...counts].map(([name, value]) => ({ name, value })) };
}

export function scopeCSV(records) {
  const cell = value => '"' + String(value).replaceAll('"', '""') + '"';
  return [['编号', '国家', '地区', '类别', '演示标题'], ...records.map(row => [row.id, row.country, row.region, row.kind, row.title])].map(row => row.map(cell).join(',')).join('\n') + '\n';
}

export function packageModel(mode) {
  const incremental = mode === 'incremental';
  return { id: incremental ? 'DEMO-DELTA-02' : 'DEMO-BASE-01', mode: incremental ? 'incremental' : 'baseline', base: incremental ? 'DEMO-BASE-01' : null,
    files: incremental ? ['manifest.json', 'changes.jsonl', 'checksums.sha256'] : ['manifest.json', 'events.jsonl', 'evidence.jsonl', 'reports.md', 'checksums.sha256'],
    purpose: '公开交互演示，不含业务记录' };
}
