// 三维仅承担大厅与展区的空间定位；所有操作入口均为原生 HTML。
export async function mountScene(host, emblem, initialHall = null) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || innerWidth <= 768 || !host) return { select() {}, dispose() {} };
  const THREE = await import('../vendor/three.module.min.js');
  if (motion.matches || innerWidth <= 768 || !host.isConnected) return { select() {}, dispose() {} };
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { return { select() {}, dispose() {} }; }
  let disposed = false, inView = true, frame = 0, tween = null;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x11151a, 23, 56);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 90);
  const aim = new THREE.Vector3(0, 1, -2);
  const base = { x: 15, y: 11, z: 25, ax: 0, ay: 1, az: -2 };
  const pose = { ...base };
  const materials = [], geometries = [];
  const material = values => { const m = new THREE.MeshStandardMaterial(values); materials.push(m); return m; };
  const stone = material({ color: 0x20282e, roughness: 0.88, metalness: 0.12 });
  const dark = material({ color: 0x10161c, roughness: 0.82 });
  const silver = material({ color: 0xa9b8be, roughness: 0.5, metalness: 0.3 });
  const glass = material({ color: 0x659ba8, roughness: 0.3, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  const light = material({ color: 0x99e7e2, emissive: 0x59c8c8, emissiveIntensity: 1.1, roughness: 0.5 });
  function mesh(geometry, mat, x, y, z, parent = scene) {
    geometries.push(geometry);
    const item = new THREE.Mesh(geometry, mat); item.position.set(x, y, z); parent.add(item); return item;
  }
  const box = (w, h, d, mat, x, y, z, parent) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  mesh(new THREE.CylinderGeometry(23, 24, 0.65, 96), stone, 0, -0.45, -4);
  // 真实几何台阶、展柜与立柱，不叠加全屏装饰粒子。
  for (let n = 0; n < 3; n++) mesh(new THREE.CylinderGeometry(3.3 - n * 0.23, 3.4 - n * 0.23, 0.16, 80), n === 2 ? silver : stone, 4, n * 0.16, 0);
  mesh(new THREE.CylinderGeometry(2.85, 3, 0.5, 80), dark, 4, 0.6, 0);
  const ring = mesh(new THREE.TorusGeometry(2.86, 0.018, 6, 100), light, 4, 0.85, 0); ring.rotation.x = Math.PI / 2;
  const hallIds = ['monitoring', 'practical', 'intelligence', 'knowledge', 'outputs', 'engineering'];
  const wings = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI * (0.95 + i * 0.19);
    const x = Math.cos(angle) * 14, z = Math.sin(angle) * 12 - 4;
    const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = -angle - Math.PI / 2; scene.add(group);
    box(6.8, 0.3, 5.2, stone, 0, 0, 0, group);
    box(6.8, 5.8, 0.32, dark, 0, 2.85, -2.5, group);
    box(0.35, 5.8, 4.8, silver, -3.2, 2.85, 0, group);
    box(0.25, 5.8, 4.8, stone, 3.2, 2.85, 0, group);
    box(6.8, 0.22, 4.8, stone, 0, 5.8, 0, group);
    const strip = box(6.1, 0.025, 0.035, light, 0, 0.23, 2.4, group);
    box(2.9, 2.7, 0.08, glass, 0, 2.5, 0, group);
    // 各馆的展品几何不同：观察屏、路线台、档案架、资料柜、成果台、架构剖面。
    if (i === 1) {
      box(4.2, 0.15, 2.5, silver, 0, 1.65, 0.2, group);
      box(0.6, 1.6, 1.6, stone, 0, 0.8, 0, group);
      for (let k = 0; k < 4; k++) box(0.12, 0.05, 1.8, light, -1.2 + k * 0.8, 1.76, 0.2, group);
    } else if (i === 3 || i === 5) {
      for (let k = 0; k < 4; k++) box(3.7, 0.1, 1.8, k === 3 ? silver : stone, 0, 0.8 + k * 0.8, 0, group);
    } else {
      for (let k = 0; k < 3; k++) box(0.8, 1.5 + k * 0.35, 0.9, silver, -1.45 + k * 1.45, 1.1, 0, group);
    }
    wings.push({ x, z, group, strip });
  }
  for (let i = 0; i < 23; i++) box(0.08, 8, 0.2, silver, -23 + i * 2, 4, -22);
  scene.add(new THREE.HemisphereLight(0xcbe4ec, 0x17222a, 2.6));
  const key = new THREE.DirectionalLight(0xf2f5ef, 4.5); key.position.set(-8, 15, 12); scene.add(key);
  const rim = new THREE.PointLight(0x81cbd1, 90, 30); rim.position.set(5, 6, -5); scene.add(rim);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x11151a, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const point = new THREE.Vector3();
  const draw = () => {
    frame = 0;
    if (disposed || !inView || document.hidden) return;
    camera.position.set(pose.x, pose.y, pose.z); aim.set(pose.ax, pose.ay, pose.az); camera.lookAt(aim);
    renderer.render(scene, camera);
    if (emblem) {
      point.set(4, 4.4, 0).project(camera);
      emblem.style.setProperty('--brand-x', `${(point.x + 1) * host.clientWidth / 2}px`);
      emblem.style.setProperty('--brand-y', `${(1 - point.y) * host.clientHeight / 2}px`);
    }
    host.dataset.ready = 'true';
  };
  const request = () => { if (!frame && !disposed && inView && !document.hidden) frame = requestAnimationFrame(draw); };
  const resize = () => {
    if (disposed) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); request();
  };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const observer = new IntersectionObserver(entries => { inView = entries.some(entry => entry.isIntersecting); if (!inView) tween?.pause(); else { tween?.resume(); resize(); } }); observer.observe(host);
  const visibility = () => { if (document.hidden) { tween?.pause(); cancelAnimationFrame(frame); frame = 0; } else { tween?.resume(); request(); } };
  const lost = event => { event.preventDefault(); dispose(); };
  const changeMotion = () => { if (motion.matches) dispose(); };
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  motion.addEventListener('change', changeMotion);
  function dispose() {
    if (disposed) return; disposed = true; tween?.kill(); cancelAnimationFrame(frame);
    resizeObserver.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', changeMotion);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove();
    host.removeAttribute('data-ready'); emblem?.style.removeProperty('--brand-x'); emblem?.style.removeProperty('--brand-y');
  }
  function select(hall) {
    if (disposed) return;
    const index = hallIds.indexOf(hall), wing = wings[index];
    const next = wing ? { x: wing.x * 0.72 + 9, y: 8, z: wing.z + 17, ax: wing.x * 0.6, ay: 1.4, az: wing.z } : base;
    tween?.kill();
    if (window.gsap && !motion.matches) tween = window.gsap.to(pose, { ...next, duration: 1.05, ease: 'power2.inOut', onUpdate: request });
    else { Object.assign(pose, next); request(); }
  }
  resize(); if (initialHall) select(initialHall);
  return { select, dispose };
}
