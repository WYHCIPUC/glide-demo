/* =========================================================
   GLIDE Demo · 主交互
   - 顶部导航毛玻璃化（滚动时）
   - 阅读进度与章节定位（品牌动效由 brand-motion.js 管理）
   - Tabs 切换 + 代码复制
   - 移动端导航
   ========================================================= */
(function(){
  // 当前章节使用可见性观察；阅读进度由统一动效时钟管理。
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if('IntersectionObserver' in window && navAnchors.length){
    const navTargets = navAnchors
      .map(link => ({ link, section:document.querySelector(link.getAttribute('href')) }))
      .filter(item => item.section);
    const visibleSections = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const current = navTargets.find(item => visibleSections.has(item.section));
      navTargets.forEach(item => {
        const active = item === current;
        item.link.classList.toggle('active', active);
        if(active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }, { rootMargin:'-28% 0px -62% 0px', threshold:0 });
    navTargets.forEach(item => sectionObserver.observe(item.section));
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
        tab.tabIndex = active ? 0 : -1;
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
      t.addEventListener('keydown', event => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if(!keys.includes(event.key)) return;
        event.preventDefault();
        const index = Array.from(tabs).indexOf(t);
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activateTab(tabs[target]);
        tabs[target].focus();
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
        btn.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('copied');
        }, 1600);
      } catch(e){
        btn.textContent = '复制失败';
        setTimeout(() => { btn.textContent = '复制'; }, 1200);
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
      if(window.innerWidth > 960 && links.classList.contains('open')){
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', event => {
      if(event.key === 'Escape' && links.classList.contains('open')){
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  // 章节使用原生锚点，保留深链接、键盘跳转和浏览器前进后退。
  // 滚动间距与减少动效由 CSS 统一处理。

  document.documentElement.classList.add('demo-ready');
})();
