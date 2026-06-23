/* =========================================================
   GLIDE Demo · 主交互
   - 顶部导航毛玻璃化（滚动时）
   - 元素入场动效（IntersectionObserver + stagger）
   - 数字滚动计数
   - Tabs 切换 + 代码复制
   - 实时情报流模拟循环
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
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      if(open){
        Object.assign(links.style, {
          display:'flex', flexDirection:'column', position:'absolute',
          top:'64px', left:'0', right:'0', padding:'14px 20px',
          background:'rgba(5,5,7,0.95)', backdropFilter:'blur(20px) saturate(180%)',
          borderBottom:'1px solid rgba(0, 217, 146, 0.18)', gap:'4px',
          zIndex:'99'
        });
        links.querySelectorAll('a').forEach(a => Object.assign(a.style, { padding:'12px 14px', color:'#cbd6e0' }));
      } else {
        links.removeAttribute('style');
        links.querySelectorAll('a').forEach(a => a.style.cssText = '');
      }
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if(links.classList.contains('open')) burger.click();
    }));
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

  // —— 8. 实时情报流循环（mock） ——
  const feedEl = document.getElementById('liveFeed');
  if(feedEl){
    const samples = [
      { src:'REUTERS',  time:'刚刚',    risk:'high', text:'美国南部边境单日拦截非法入境人数 <strong>创年内新高</strong>，CBP 启动额外安置预案。' },
      { src:'BBC',      time:'2 分钟前', risk:'mid',  text:'德国联邦内政部宣布延长 <strong>波兰边境临时管控</strong> 30 天，理由：非法入境压力持续。' },
      { src:'NHK',      time:'6 分钟前', risk:'low',  text:'日本法务省公布新财年 <strong>特定技能 2 号签证</strong> 扩容草案，覆盖 11 个行业。' },
      { src:'半岛电视台', time:'11 分钟前', risk:'high', text:'土耳其与希腊边境 <strong>难民船倾覆事件</strong> 引发地区外交斡旋。' },
      { src:'LE MONDE', time:'18 分钟前', risk:'mid',  text:'法国议会通过法案，强化 <strong>庇护申请材料数字化</strong> 与审核时限。' },
      { src:'新华社',  time:'24 分钟前', risk:'low',  text:'外交部回应边境管理政策调整，强调 <strong>合法出入境渠道畅通</strong>。' },
      { src:'ABC AU',   time:'32 分钟前', risk:'mid',  text:'澳大利亚宣布对部分太平洋岛国实施 <strong>特殊劳工签证试点</strong>。' },
      { src:'CNN',      time:'41 分钟前', risk:'high', text:'美墨边境 <strong>人口走私网络</strong> 主嫌在德州落网，涉 14 州。' }
    ];
    let cursor = 0;
    function prependNext(){
      const item = samples[cursor % samples.length];
      cursor++;
      const row = document.createElement('div');
      row.className = 'glass-card live-feed-row reveal';
      row.innerHTML = `
        <div class="meta">
          <span class="src">${item.src}</span>
          <span class="time">${item.time}</span>
        </div>
        <div class="body">${item.text}</div>
        <span class="risk ${item.risk}">${item.risk === 'high' ? '高风险' : item.risk === 'mid' ? '中风险' : '低风险'}</span>
      `;
      row.style.opacity = '0';
      row.style.transform = 'translateY(-8px)';
      feedEl.insertBefore(row, feedEl.firstChild);
      // 限制最多 5 行
      while(feedEl.children.length > 5){
        feedEl.removeChild(feedEl.lastChild);
      }
      requestAnimationFrame(() => {
        row.style.transition = 'opacity .45s ease, transform .45s ease';
        row.style.opacity = '1';
        row.style.transform = 'none';
      });
    }
    // 仅当可视时启动循环
    let timer = null;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting && !timer){
          timer = setInterval(prependNext, 4500);
        } else if(!e.isIntersecting && timer){
          clearInterval(timer); timer = null;
        }
      });
    }, { threshold: 0.2 });
    io.observe(feedEl);
  }
})();