// 同一获选画面的有限镜头转场；静态图始终保底，不构造替代性的展柜或地图。
export const shouldMoveCamera = ({ animate = true, enabled = true, reduced = false }) => animate && enabled && !reduced;
export async function mountScene(host, _emblem, initialHall = null) {
  const idle = { select() {}, dispose() {} };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || innerWidth <= 768 || !host) return idle;
  const THREE = await import('../vendor/three.module.min.js');
  if (motion.matches || innerWidth <= 768 || !host.isConnected) return idle;
  let renderer, texture;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    texture = await new THREE.TextureLoader().loadAsync(new URL('../assets/global-observatory.webp', import.meta.url).href);
  } catch {
    renderer?.dispose();
    return idle;
  }
  if (motion.matches || innerWidth <= 768 || !host.isConnected) {
    texture.dispose(); renderer.dispose(); return idle;
  }
  let disposed = false, inView = true, frame = 0, tween = null;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10);
  camera.position.z = 2;
  texture.colorSpace = THREE.SRGBColorSpace;
  const imageAspect = texture.image.width / texture.image.height;
  const geometry = new THREE.PlaneGeometry(imageAspect * 2, 2);
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const plate = new THREE.Mesh(geometry, material);
  scene.add(plate);
  const pose = { zoom: 1 };
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const draw = () => {
    frame = 0;
    if (disposed || !inView || document.hidden) return;
    camera.zoom = pose.zoom; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    host.dataset.ready = 'true';
  };
  const request = () => {
    if (!frame && !disposed && inView && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const resize = () => {
    if (disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    renderer.setSize(width, height, false);
    camera.left = -aspect; camera.right = aspect;
    plate.scale.setScalar(Math.max(1, aspect / imageAspect));
    camera.updateProjectionMatrix(); request();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    if (!inView) { tween?.pause(); cancelAnimationFrame(frame); frame = 0; }
    else if (!document.hidden) { tween?.resume(); resize(); }
  });
  observer.observe(host);
  const visibility = () => {
    if (document.hidden) { tween?.pause(); cancelAnimationFrame(frame); frame = 0; }
    else if (inView) { tween?.resume(); request(); }
  };
  const lost = event => { event.preventDefault(); dispose(); };
  const changeMotion = () => { if (motion.matches) dispose(); };
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  motion.addEventListener('change', changeMotion);
  function dispose() {
    if (disposed) return;
    disposed = true; tween?.kill(); cancelAnimationFrame(frame);
    resizeObserver.disconnect(); observer.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', changeMotion);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    texture.dispose(); geometry.dispose(); material.dispose(); renderer.dispose();
    renderer.domElement.remove(); host.removeAttribute('data-ready');
  }
  function select(hall, { animate = true } = {}) {
    if (disposed) return;
    tween?.kill();
    const zoom = hall ? 1.025 : 1;
    if (window.gsap && shouldMoveCamera({ animate, enabled: document.documentElement.dataset.motionEnabled !== 'false', reduced: motion.matches })) {
      tween = window.gsap.to(pose, { zoom, duration: .7, ease: 'power2.inOut', onUpdate: request, paused: document.hidden || !inView });
    } else { pose.zoom = zoom; request(); }
  }
  resize(); if (initialHall) select(initialHall);
  return { select, dispose };
}
