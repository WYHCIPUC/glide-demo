/* =========================================================
   GLIDE Demo · 主交互
   - 顶部导航毛玻璃化（滚动时）
   - 元素入场动效（IntersectionObserver + stagger）
   - 数字滚动计数
   - Tabs 切换 + 代码复制
   - 移动端导航
   ========================================================= */
(function(){
  // —— 1. Nav 滚动毛玻璃 ——
  const nav = document.getElementById('nav');
  if(nav){
    let ticking = false;
    const onScroll = () => {
      if(!ticking){
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // —— 2. IntersectionObserver 入场动效 ——
  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if(e.isIntersecting){
          const parent = e.target.parentElement;
          if(parent){
            const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
            const idx = siblings.indexOf(e.target);
            e.target.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
          }
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin:'0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // —— 3. 数字滚动计数 ——
  function animateCount(el){
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const hasSmall = el.querySelector('small');
    function step(now){
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = target * e;
      const txt = (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix;
      if(hasSmall){
        el.innerHTML = txt + hasSmall.outerHTML;
      } else {
        el.textContent = txt;
      }
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window && counters.length){
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => animateCount(el));
  }

  // —— 4. Tabs 切换 ——
  const tabs = document.querySelectorAll('.tab[data-tab]');
  const panels = document.querySelectorAll('.tab-panel[data-panel]');
  if(tabs.length){
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        const key = t.dataset.tab;
        tabs.forEach(x => x.classList.toggle('active', x === t));
        panels.forEach(p => p.classList.toggle('active', p.dataset.panel === key));
      });
    });
  }

  // —— 5. 代码复制 ——
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const block = btn.parentElement.querySelector('pre');
      if(!block) return;
      try {
        await navigator.clipboard.writeText(block.innerText);
        const old = btn.textContent;
        btn.textContent = 'COPIED';
        btn.style.color = '#00d992';
        btn.style.borderColor = '#00d992';
        setTimeout(() => {
          btn.textContent = old;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 1600);
      } catch(e){
        btn.textContent = 'ERROR';
        setTimeout(() => { btn.textContent = 'COPY'; }, 1200);
      }
    });
  });

  // —— 6. 移动端汉堡菜单 ——
  const burger = document.querySelector('.nav-burger');
  const links  = document.querySelector('.nav-links');
  if(burger && links){
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if(links.classList.contains('open')) burger.click();
    }));
    window.addEventListener('resize', () => {
      if(window.innerWidth > 1100 && links.classList.contains('open')){
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // —— 7. 平滑滚动到锚点 ——
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if(id.length > 1){
        const target = document.querySelector(id);
        if(target){
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior:'smooth' });
        }
      }
    });
  });

})();
