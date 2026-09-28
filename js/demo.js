/* =========================================================
   GLIDE Demo · 主交互
   - 顶部导航毛玻璃化（滚动时）
   - 元素入场动效（IntersectionObserver + stagger）
   - 数字滚动计数
   - Tabs 切换 + 代码复制
   - 移动端导航
   ========================================================= */
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // —— 1. Nav 滚动状态、阅读进度与当前章节 ——
  const nav = document.getElementById('nav');
  if(nav){
    let ticking = false;
    const onScroll = () => {
      if(!ticking){
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 24);
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          nav.style.setProperty('--scroll-progress', Math.min(1, window.scrollY / maxScroll).toFixed(4));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if('IntersectionObserver' in window && navAnchors.length){
    const navTargets = navAnchors
      .map(link => ({ link, section:document.querySelector(link.getAttribute('href')) }))
      .filter(item => item.section);
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        navTargets.forEach(item => {
          const active = item.section === entry.target;
          item.link.classList.toggle('active', active);
          if(active) item.link.setAttribute('aria-current', 'location');
          else item.link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin:'-28% 0px -62% 0px', threshold:0 });
    navTargets.forEach(item => sectionObserver.observe(item.section));
  }

  // —— 2. IntersectionObserver 入场动效 ——
  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length && !reducedMotion){
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
    document.documentElement.classList.add('demo-motion-ready');
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // —— 3. 数字滚动计数 ——
  function animateCount(el){
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = reducedMotion ? 0 : 1400;
    const start = performance.now();
    const hasSmall = el.querySelector('small');
    function step(now){
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
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
    const activateTab = (selected) => {
      const key = selected.dataset.tab;
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => {
        const active = panel.dataset.panel === key;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    };
    tabs.forEach((t) => {
      const key = t.dataset.tab;
      const panel = document.querySelector(`.tab-panel[data-panel="${key}"]`);
      t.id = `tab-${key}`;
      t.setAttribute('aria-controls', `panel-${key}`);
      if(panel){
        panel.id = `panel-${key}`;
        panel.setAttribute('aria-labelledby', t.id);
      }
      t.addEventListener('click', () => {
        activateTab(t);
      });
    });
    activateTab(document.querySelector('.tab.active[data-tab]') || tabs[0]);
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
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('copied');
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

  // 章节使用原生锚点，保留深链接、键盘跳转和浏览器前进后退。
  // 滚动间距与减少动效由 CSS 统一处理。

  document.documentElement.classList.add('demo-ready');
})();
