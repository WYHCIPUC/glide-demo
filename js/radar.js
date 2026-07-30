/* =========================================================
   GLIDE Demo · Hero 背景三层 + 全页世界地图背景
   - world-bg（全页 fixed · ECharts 世界地图 · 缓慢漂移循环）
   - radar-canvas（hero 区 · 雷达扫描 + 9 热点脉冲）
   - particle-canvas（hero 区 · 浮游微粒）
   ========================================================= */
(function(){
  const isCompact = window.matchMedia('(max-width: 560px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // —— Layer 1: 全页世界地图（ECharts geo · 缓慢漂移） ——
  function initWorldMap(){
    const el = document.getElementById('worldCanvas');
    if(!el || typeof echarts === 'undefined') return;
    const chart = echarts.init(el, null, { renderer:'canvas' });
    fetch('./data/world.json').then(r => r.ok ? r.json() : Promise.reject()).then(worldJson => {
      echarts.registerMap('world', worldJson);

      // 初始化配置
      chart.setOption({
        geo:{
          map:'world',
          roam:false,
          zoom:1.0,
          center:[0, 0],
          silent:true,
          left:0, right:0, top:0, bottom:0,
          layoutCenter:['50%','50%'],
          layoutSize:'120%',
          itemStyle:{
            areaColor:'rgba(26, 26, 46, 0.42)',
            borderColor:'rgba(0, 217, 146, 0.55)',
            borderWidth:0.9,
            shadowColor:'rgba(0, 217, 146, 0.35)',
            shadowBlur:8
          },
          emphasis:{ disabled:true },
          select:{ disabled:true }
        }
      });

      // 低频漂移即可形成“巡视地球”感，避免每帧触发 ECharts 重绘。
      const PERIOD = 32;
      const start = performance.now();
      function updateDrift(){
        const t = (performance.now() - start) / 1000;
        const phase = (t / PERIOD) * Math.PI * 2;
        const cx = Math.sin(phase) * 6;
        const cy = Math.cos(phase * 0.7) * 3.5;
        const zoom = 1.0 + Math.sin(phase * 0.5) * 0.04;
        chart.setOption({ geo:{ center:[cx, cy], zoom:zoom } }, false, true);
      }
      let driftTimer = null;
      const startDrift = () => {
        if(driftTimer || isCompact || prefersReducedMotion) return;
        updateDrift();
        driftTimer = window.setInterval(updateDrift, 250);
      };
      const stopDrift = () => {
        if(!driftTimer) return;
        window.clearInterval(driftTimer);
        driftTimer = null;
      };
      startDrift();

      // 页面不可见时暂停，可见时继续
      document.addEventListener('visibilitychange', () => {
        if(document.hidden) stopDrift();
        else startDrift();
      });
    }).catch(() => { /* 静默：失败时只显示雷达与粒子 */ });

    window.addEventListener('resize', () => chart.resize());
  }

  // —— Layer 2: 雷达扫描 + 热点 ——
  function initRadar(){
    const canvas = document.getElementById('radarCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha:true });
    let w=0, h=0, dpr=1, raf=0, t=0;

    const hotspots = [
      {x:0.16, y:0.42, r:0, phase:0.0,  size:1.4, label:'US'},
      {x:0.22, y:0.55, r:0, phase:0.5,  size:1.0, label:'MEX'},
      {x:0.28, y:0.30, r:0, phase:1.0,  size:1.2, label:'CA'},
      {x:0.48, y:0.32, r:0, phase:1.5,  size:1.5, label:'EU'},
      {x:0.52, y:0.45, r:0, phase:2.0,  size:1.2, label:'ME'},
      {x:0.55, y:0.62, r:0, phase:2.5,  size:1.1, label:'AF'},
      {x:0.72, y:0.36, r:0, phase:3.0,  size:1.4, label:'CN'},
      {x:0.78, y:0.50, r:0, phase:3.5,  size:1.1, label:'SEA'},
      {x:0.85, y:0.72, r:0, phase:4.0,  size:1.2, label:'AU'}
    ];

    function drawRadar(cx, cy, radius){
      ctx.save();
      // 同心圆
      ctx.strokeStyle = 'rgba(0, 217, 146, 0.28)';
      ctx.lineWidth = 1;
      for(let i=1; i<=5; i++){
        ctx.beginPath();
        ctx.arc(cx, cy, radius * (i/5), 0, Math.PI*2);
        ctx.stroke();
      }
      // 十字
      ctx.strokeStyle = 'rgba(0, 217, 146, 0.32)';
      ctx.beginPath(); ctx.moveTo(cx-radius, cy); ctx.lineTo(cx+radius, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy-radius); ctx.lineTo(cx, cy+radius); ctx.stroke();
      // 12 刻度
      ctx.strokeStyle = 'rgba(0, 217, 146, 0.5)';
      const ticks = 24;
      for(let i=0; i<ticks; i++){
        const a = (i/ticks) * Math.PI*2;
        const r1 = radius;
        const r2 = radius * (i % 6 === 0 ? 0.86 : 0.93);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a)*r1, cy + Math.sin(a)*r1);
        ctx.lineTo(cx + Math.cos(a)*r2, cy + Math.sin(a)*r2);
        ctx.stroke();
      }
      // 扫描扇形
      const sweep = Math.PI * 0.5;
      const ang = t * 0.0009;
      if(ctx.createConicGradient){
        const grad = ctx.createConicGradient(ang, cx, cy);
        grad.addColorStop(0,    'rgba(0, 217, 146, 0.0)');
        grad.addColorStop(0.04, 'rgba(0, 217, 146, 0.45)');
        grad.addColorStop(sweep/(Math.PI*2), 'rgba(0, 255, 255, 0.15)');
        grad.addColorStop(1,    'rgba(0, 217, 146, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, ang, ang + sweep);
        ctx.closePath();
        ctx.fill();
      }
      // 中心核
      ctx.fillStyle = '#00d992';
      ctx.shadowColor = '#00d992'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // 扫描主光线
      const tipX = cx + Math.cos(ang) * radius;
      const tipY = cy + Math.sin(ang) * radius;
      const tipGrad = ctx.createLinearGradient(cx, cy, tipX, tipY);
      tipGrad.addColorStop(0, 'rgba(0, 217, 146, 0.8)');
      tipGrad.addColorStop(1, 'rgba(0, 217, 146, 0.0)');
      ctx.strokeStyle = tipGrad;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.restore();
    }

    function drawHotspots(cx, cy, radius){
      hotspots.forEach(h => {
        const x = cx - radius + h.x * radius * 2;
        const y = cy - radius + h.y * radius * 2;
        const pulse = (Math.sin(t * 0.002 + h.phase) + 1) / 2;
        const r = 4 + pulse * 9 * h.size;
        ctx.save();
        // 外圈涟漪
        ctx.strokeStyle = `rgba(0, 217, 146, ${0.22 - pulse*0.16})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
        // 二圈
        if(pulse > 0.5){
          ctx.strokeStyle = `rgba(0, 217, 146, ${(1 - pulse) * 0.18})`;
          ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI*2); ctx.stroke();
        }
        // 内核
        ctx.fillStyle = `rgba(0, 217, 146, ${0.65 + pulse*0.35})`;
        ctx.shadowColor = '#00d992'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
    }

    function drawConnections(cx, cy, radius){
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 217, 146, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const pts = hotspots.map(h => ({
        x: cx - radius + h.x * radius * 2,
        y: cy - radius + h.y * radius * 2
      }));
      // 部分节点间连接
      const pairs = [[0,3],[3,6],[6,0],[1,2],[4,5],[7,8]];
      pairs.forEach((p, i) => {
        const a = pts[p[0]], b = pts[p[1]];
        const mx = (a.x + b.x)/2 + Math.sin(t*0.001 + i*1.3) * 14;
        const my = (a.y + b.y)/2 + Math.cos(t*0.001 + i*1.3) * 14;
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth = canvas.parentElement.clientWidth;
      h = canvas.clientHeight = canvas.parentElement.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let lastFrame = 0;
    function frame(now){
      if(isCompact && now - lastFrame < 33){
        raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
      t = now;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5, cy = h * 0.55;
      const radius = Math.min(w, h) * 0.34;
      drawConnections(cx, cy, radius);
      drawRadar(cx, cy, radius);
      drawHotspots(cx, cy, radius);
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
      if(document.hidden){ cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });

    resize();
    raf = requestAnimationFrame(frame);
  }

  // —— Layer 3: 浮游粒子 ——
  function initParticles(){
    const canvas = document.getElementById('particleCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha:true });
    let w=0, h=0, dpr=1, raf=0;
    const COUNT = isCompact ? 28 : 70;
    const particles = [];

    function rand(a, b){ return a + Math.random() * (b - a); }

    function make(){
      return {
        x: rand(0, 1), y: rand(0, 1),
        vx: rand(-0.00015, 0.00015), vy: rand(-0.00015, 0.00015),
        r: rand(0.6, 1.8),
        twinkle: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.005, 0.018),
        color: Math.random() < 0.7 ? '#00d992' : (Math.random() < 0.5 ? '#00ffff' : '#ffffff')
      };
    }

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth = canvas.parentElement.clientWidth;
      h = canvas.clientHeight = canvas.parentElement.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(t){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < -0.05) p.x = 1.05;
        if(p.x > 1.05)  p.x = -0.05;
        if(p.y < -0.05) p.y = 1.05;
        if(p.y > 1.05)  p.y = -0.05;
        p.twinkle += p.twinkleSpeed;
        const a = 0.35 + 0.45 * (Math.sin(p.twinkle) * 0.5 + 0.5);
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
      if(document.hidden){ cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });

    for(let i=0; i<COUNT; i++) particles.push(make());
    resize();
    raf = requestAnimationFrame(frame);
  }

  // —— 启动三层 ——
  initWorldMap();
  if(!prefersReducedMotion){
    initRadar();
    initParticles();
  }

  // —— Telemetry Clock ——
  function startClock(){
    const el = document.getElementById('teleClock');
    if(!el) return;
    const tick = () => {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      el.textContent = `UTC+8  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }
  startClock();
})();
