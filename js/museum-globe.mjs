// NASA 自然地形与概念连线只作公开站点背景，不表示事件、风险或实时航线。
const TAU = Math.PI * 2, DEGREE = Math.PI / 180;
const DEFAULT_LAYOUT = Object.freeze({ width: 1586, height: 992, x: 1190, y: 640, radius: 744 });
const MODE_STATES = Object.freeze({
  earth: Object.freeze({ terrain: 1, grid: .05, network: 0 }),
  grid: Object.freeze({ terrain: 0, grid: .46, network: 0 }),
  network: Object.freeze({ terrain: .55, grid: .1, network: .85 }),
});
const IDLE = Object.freeze({ setMode() {}, setRunning() {}, dispose() {} });

export function geoToCartesian(latitude, longitude, radius = 1) {
  if (![latitude, longitude, radius].every(Number.isFinite) || radius <= 0) throw new RangeError('经纬度及半径必须是有效数值。');
  const latitudeRadians = Math.max(-90, Math.min(90, latitude)) * DEGREE;
  const longitudeRadians = longitude * DEGREE;
  const ring = radius * Math.cos(latitudeRadians);
  // SphereGeometry 的纹理 u=0 位于西经 180°；此映射与自然地形纹理共用朝向。
  return { x: ring * Math.cos(longitudeRadians), y: radius * Math.sin(latitudeRadians), z: -ring * Math.sin(longitudeRadians) };
}

export function advanceRotation(angle, deltaSeconds, periodSeconds = 180) {
  const seconds = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
  const period = Number.isFinite(periodSeconds) && periodSeconds > 0 ? periodSeconds : 180;
  return ((angle + seconds * TAU / period) % TAU + TAU) % TAU;
}

export function coverGlobeLayout(width, height, layout = DEFAULT_LAYOUT) {
  const source = { ...DEFAULT_LAYOUT, ...layout };
  const scale = Math.max(width / source.width, height / source.height);
  return {
    x: source.x * scale + (width - source.width * scale) / 2,
    y: source.y * scale + (height - source.height * scale) / 2,
    radius: source.radius * scale, scale,
  };
}

export const shouldRunGlobe = state => state.requested && !state.hidden && state.inView && !state.reduced && state.desktop && state.connected && !state.disposed;
export const globeModeState = mode => ({ ...(Object.hasOwn(MODE_STATES, mode) ? MODE_STATES[mode] : MODE_STATES.earth) });

function createGrid(THREE) {
  const positions = [];
  const segment = (start, end) => positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    for (let longitude = -180; longitude < 180; longitude += 4) segment(geoToCartesian(latitude, longitude, 1.004), geoToCartesian(latitude, longitude + 4, 1.004));
  }
  for (let longitude = -180; longitude < 180; longitude += 30) {
    for (let latitude = -90; latitude < 90; latitude += 3) segment(geoToCartesian(latitude, longitude, 1.004), geoToCartesian(latitude + 3, longitude, 1.004));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createNetwork(THREE) {
  // 固定构图锚点，均绑定同一球体；不从业务数据生成，也不附带状态或数值。
  const anchors = [[23.13, 113.26], [41.3, 69.2], [25.2, 55.3], [1.3, 103.8], [35.7, 139.7], [48.9, 2.3], [-6.2, 106.8], [-33.9, 151.2]];
  const points = anchors.map(([latitude, longitude]) => new THREE.Vector3(...Object.values(geoToCartesian(latitude, longitude, 1.01))));
  const positions = [];
  for (const end of points.slice(1)) {
    let previous = points[0];
    for (let step = 1; step <= 48; step++) {
      const progress = step / 48;
      const current = new THREE.Vector3().lerpVectors(points[0], end, progress).normalize().multiplyScalar(1.01 + Math.sin(progress * Math.PI) * .1);
      positions.push(previous.x, previous.y, previous.z, current.x, current.y, current.z);
      previous = current;
    }
  }
  const lines = new THREE.BufferGeometry(); lines.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const nodes = new THREE.BufferGeometry().setFromPoints(points);
  return { lines, nodes };
}

function readColors(THREE, host, view, colors) {
  const style = view.getComputedStyle(host);
  const tokens = {
    ocean: ['--globe-ocean', '--map-land', '--bg-carbon'],
    atmosphere: ['--globe-atmosphere', '--accent-emerald'],
    line: ['--globe-line', '--accent-emerald'],
    light: ['--globe-light', '--ink'],
  };
  return Object.fromEntries(Object.entries(tokens).map(([key, names]) => {
    const value = colors[key] || names.map(name => style.getPropertyValue(name).trim()).find(Boolean);
    if (!value) throw new Error(`地球材质缺少 ${names[0]} 颜色令牌。`);
    return [key, new THREE.Color(value)];
  }));
}

/**
 * host 需覆盖原图画框；布局坐标沿用 1586×992 原图并采用居中 cover。
 * onReady 后由调用方隐藏完整 poster、展示透明前景；onFailure 恢复 poster。
 * loadThree、view、page 可替换加载器与浏览器环境，默认使用本站依赖。
 */
export async function mountGlobe(host, {
  mode = 'earth', onReady, onFailure, layout = DEFAULT_LAYOUT, colors = {},
  periodSeconds = 180, initialLongitude = 106, initialLatitude = 20,
  signal,
  page = host?.ownerDocument || globalThis.document,
  view = page?.defaultView || globalThis.window,
  loadThree = () => import('../vendor/three.module.min.js'),
} = {}) {
  if (!host?.isConnected || !view || view.innerWidth <= 768 || signal?.aborted) return IDLE;
  const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (media?.matches) return IDLE;
  let disposed = false, ready = false, requested = true, inView = !view.IntersectionObserver;
  let frame = 0, previousTime = null, dirty = true, transition = null;
  let renderer, scene, camera, anchor, body, terrain, grid, network, nodes, keyLight, shaderError;
  const cleanup = [];
  const track = resource => { if (disposed) resource.dispose(); else cleanup.push(() => resource.dispose()); return resource; };
  const listen = (target, event, callback) => {
    target?.addEventListener(event, callback);
    cleanup.push(() => target?.removeEventListener(event, callback));
  };
  const state = () => ({ requested, hidden: !!page.hidden, inView, reduced: !!media?.matches, desktop: view.innerWidth > 768, connected: host.isConnected, disposed });
  const canDraw = () => { const current = state(); return shouldRunGlobe({ ...current, requested: true }); };
  const cancel = () => { if (frame) view.cancelAnimationFrame(frame); frame = 0; previousTime = null; };
  function dispose() {
    if (disposed) return;
    disposed = true; cancel(); transition = null;
    for (const release of cleanup.splice(0).reverse()) {
      try { release(); } catch { /* 一项释放失败不能阻断其余资源清理。 */ }
    }
  }
  function fail(error) {
    if (disposed) return;
    dispose(); onFailure?.(error);
  }
  const fallback = reason => fail(Object.assign(new Error('已恢复静态地球画面。'), { reason }));
  const schedule = () => { if (!frame && canDraw()) frame = view.requestAnimationFrame(draw); };
  function applyMode(values) {
    terrain.material.opacity = values.terrain;
    grid.material.opacity = values.grid;
    network.material.opacity = nodes.material.opacity = values.network;
    terrain.visible = values.terrain > .001;
    grid.visible = values.grid > .001;
    network.visible = nodes.visible = values.network > .001;
  }
  function setMode(nextMode, { animate = true } = {}) {
    if (disposed || !terrain) return;
    const target = globeModeState(nextMode);
    if (animate && shouldRunGlobe(state()) && ready) {
      transition = { elapsed: 0, from: { terrain: terrain.material.opacity, grid: grid.material.opacity, network: network.material.opacity }, target };
    } else { transition = null; applyMode(target); }
    dirty = true; schedule();
  }
  function setRunning(value) {
    if (disposed) return;
    requested = !!value; cancel();
    if (requested || !ready) schedule();
  }
  function sync() {
    cancel();
    if (canDraw() && (requested || !ready)) { dirty = true; schedule(); }
  }
  function draw(time) {
    frame = 0;
    if (!canDraw()) { previousTime = null; return; }
    const running = shouldRunGlobe(state());
    const elapsed = previousTime === null ? 0 : Math.max(0, time - previousTime);
    if (!dirty && ready && running && elapsed < 1000 / 30) { schedule(); return; }
    // 暂停/后台/离屏时清空时间基线；前台帧率下降仍按实际秒数推进。
    const seconds = running ? elapsed / 1000 : 0;
    previousTime = running ? time : null;
    if (running) body.rotation.y = advanceRotation(body.rotation.y, seconds, periodSeconds);
    if (transition && running) {
      transition.elapsed += seconds;
      const progress = Math.min(1, transition.elapsed / .65);
      const eased = progress * progress * (3 - 2 * progress);
      applyMode(Object.fromEntries(Object.keys(transition.target).map(key => [key, transition.from[key] + (transition.target[key] - transition.from[key]) * eased])));
      if (progress === 1) transition = null;
    }
    try {
      renderer.render(scene, camera);
      if (shaderError) { fail(shaderError); return; }
      if (disposed) return;
      dirty = false;
      if (!ready) { ready = true; onReady?.(); }
    } catch (error) { fail(error); return; }
    if (running && !disposed) schedule();
  }
  function resize() {
    if (disposed || !renderer) return;
    if (view.innerWidth <= 768) { fallback('small-screen'); return; }
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) { cancel(); return; }
    const pose = coverGlobeLayout(width, height, layout);
    anchor.position.set(pose.x, height - pose.y, 0); anchor.scale.setScalar(pose.radius);
    camera.left = 0; camera.right = width; camera.top = height; camera.bottom = 0;
    camera.near = pose.radius * .1; camera.far = pose.radius * 8; camera.position.z = pose.radius * 4;
    camera.updateProjectionMatrix();
    keyLight.position.set(pose.x - pose.radius * 2, height - pose.y + pose.radius * 2, pose.radius * 3);
    keyLight.target.position.copy(anchor.position);
    renderer.setPixelRatio(Math.min(view.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false); dirty = true; schedule();
  }
  listen(signal, 'abort', dispose);
  try {
    const THREE = await loadThree();
    if (disposed || !host.isConnected || media?.matches || view.innerWidth <= 768) { dispose(); return IDLE; }
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    cleanup.push(() => { renderer.domElement.remove(); renderer.dispose(); renderer.forceContextLoss?.(); });
    if (renderer.debug) renderer.debug.onShaderError = () => { shaderError = Object.assign(new Error('地球着色器编译失败。'), { reason: 'shader-error' }); };
    const texture = track(await new THREE.TextureLoader().loadAsync(new URL('../assets/earth-blue-marble.webp', import.meta.url).href));
    if (disposed || !host.isConnected || media?.matches || view.innerWidth <= 768) { dispose(); return IDLE; }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities?.getMaxAnisotropy?.() || 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const palette = readColors(THREE, host, view, colors);
    scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(0, 1, 1, 0, .1, 10);
    anchor = new THREE.Group(); const axis = new THREE.Group(); body = new THREE.Group(); body.name = 'globe-body';
    axis.rotation.x = initialLatitude * DEGREE;
    body.rotation.y = advanceRotation(-(90 + initialLongitude) * DEGREE, 0);
    axis.add(body); anchor.add(axis); scene.add(anchor);
    const sphere = track(new THREE.SphereGeometry(1, 72, 48));
    const ocean = new THREE.Mesh(sphere, track(new THREE.MeshBasicMaterial({ color: palette.ocean })));
    ocean.name = 'globe-ocean'; body.add(ocean);
    terrain = new THREE.Mesh(sphere, track(new THREE.MeshStandardMaterial({ map: texture, color: palette.light, roughness: .88, metalness: 0, transparent: true, depthWrite: false })));
    terrain.name = 'globe-terrain'; terrain.scale.setScalar(1.001); terrain.renderOrder = 1; body.add(terrain);
    grid = new THREE.LineSegments(track(createGrid(THREE)), track(new THREE.LineBasicMaterial({ color: palette.line, transparent: true, depthWrite: false })));
    grid.name = 'globe-grid'; grid.renderOrder = 2; body.add(grid);
    const routes = createNetwork(THREE);
    network = new THREE.LineSegments(track(routes.lines), track(new THREE.LineBasicMaterial({ color: palette.line, transparent: true, depthWrite: false })));
    network.name = 'globe-network'; network.renderOrder = 3; body.add(network);
    nodes = new THREE.Points(track(routes.nodes), track(new THREE.PointsMaterial({ color: palette.line, size: 4, transparent: true, depthWrite: false, sizeAttenuation: false })));
    nodes.name = 'globe-nodes'; nodes.renderOrder = 3; body.add(nodes);
    const atmosphere = new THREE.Mesh(sphere, track(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      uniforms: { glowColor: { value: palette.atmosphere } },
      vertexShader: 'varying vec3 surfaceNormal; varying vec3 viewPosition; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);surfaceNormal=normalize(normalMatrix*normal);viewPosition=p.xyz;gl_Position=projectionMatrix*p;}',
      fragmentShader: 'uniform vec3 glowColor; varying vec3 surfaceNormal; varying vec3 viewPosition; void main(){float rim=pow(1.0-abs(dot(normalize(surfaceNormal),normalize(-viewPosition))),2.4);gl_FragColor=vec4(glowColor,rim*0.42);}',
    })));
    atmosphere.name = 'globe-atmosphere'; atmosphere.scale.setScalar(1.025); atmosphere.renderOrder = 4; body.add(atmosphere);
    scene.add(new THREE.AmbientLight(palette.light, 1.05));
    keyLight = new THREE.DirectionalLight(palette.light, 2.2); scene.add(keyLight, keyLight.target);
    applyMode(globeModeState(mode));
    host.append(renderer.domElement);
    listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fallback('context-lost'); });
    listen(page, 'visibilitychange', sync);
    listen(media, 'change', () => { if (media.matches) fallback('reduced-motion'); else sync(); });
    listen(view, 'resize', resize);
    if (view.ResizeObserver) {
      const observer = new view.ResizeObserver(resize); cleanup.push(() => observer.disconnect()); observer.observe(host);
    }
    if (view.IntersectionObserver) {
      const observer = new view.IntersectionObserver(entries => { inView = entries.some(entry => entry.isIntersecting); sync(); }, { threshold: .02 });
      cleanup.push(() => observer.disconnect()); observer.observe(host);
    }
    resize();
    return { setMode, setRunning, dispose };
  } catch (error) { fail(error); return IDLE; }
}
