/* 境鉴公开展厅：正式标志播放与渐进动效。正文始终在 HTML 中可读。 */
(function(){
  function shouldPlayBrand(state){
    return !state.reducedMotion && !state.userPaused && state.inView && state.pageVisible && !state.failed;
  }

  function createBrandPlayer({video, emblem, button, media, page, Observer, onReady = () => {}}){
    const state = {reducedMotion:media.matches, userPaused:false, inView:!Observer, pageVisible:!page.hidden, failed:false};
    const listeners = [];
    let disposed = false;
    let request = 0;
    let playPending = false;
    const listen = (target, event, handler) => {
      target.addEventListener(event, handler);
      listeners.push(() => target.removeEventListener(event, handler));
    };
    const render = () => {
      button.hidden = state.failed || state.reducedMotion;
      button.textContent = state.userPaused ? '播放标志动效' : '暂停标志动效';
    };
    const fallback = () => {
      emblem.removeAttribute('data-ready');
      video.pause();
    };
    const sync = () => {
      if(disposed) return;
      render();
      if(!shouldPlayBrand(state)){
        request += 1;
        playPending = false;
        video.pause();
        if(state.failed || state.reducedMotion) fallback();
        return;
      }
      if(playPending || !video.paused) return;
      if(!video.getAttribute('src')) video.src = video.getAttribute('data-src');
      const currentRequest = ++request;
      playPending = true;
      Promise.resolve(video.play()).catch(error => {
        if(disposed || currentRequest !== request || error.name === 'AbortError') return;
        if(error.name === 'NotAllowedError') state.userPaused = true;
        else state.failed = true;
        fallback();
        render();
      }).finally(() => {
        if(currentRequest === request) playPending = false;
      });
    };
    listen(video, 'playing', () => {
      if(!shouldPlayBrand(state)) return video.pause();
      emblem.setAttribute('data-ready', 'true');
      onReady();
    });
    listen(video, 'error', () => { state.failed = true; sync(); });
    listen(button, 'click', () => { state.userPaused = !state.userPaused; sync(); });
    listen(media, 'change', () => { state.reducedMotion = media.matches; sync(); });
    listen(page, 'visibilitychange', () => { state.pageVisible = !page.hidden; sync(); });
    const observer = Observer ? new Observer(entries => {
      state.inView = entries.some(entry => entry.isIntersecting);
      sync();
    }, {threshold:0.08}) : null;
    if(observer) observer.observe(emblem);
    sync();
    return () => {
      disposed = true;
      request += 1;
      observer?.disconnect();
      listeners.forEach(remove => remove());
      fallback();
      button.hidden = true;
    };
  }

  if(typeof module !== 'undefined') module.exports = {shouldPlayBrand, createBrandPlayer};
  if(typeof window === 'undefined' || typeof document === 'undefined') return;

  let disposePage = null;
  function mount(){
    if(disposePage) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups = [];
    const {gsap, ScrollTrigger, Lenis} = window;
    const video = document.getElementById('brand-video');
    const emblem = document.querySelector('.hero-emblem');
    const button = document.getElementById('brand-motion-toggle');
    if(video && emblem && button){
      cleanups.push(createBrandPlayer({video, emblem, button, media, page:document,
        Observer:window.IntersectionObserver, onReady:() => ScrollTrigger?.refresh()}));
    }

    if(gsap && ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      const nav=document.getElementById('nav');
      const progress=ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
        nav?.style.setProperty('--scroll-progress',self.progress.toFixed(4));
      }});
      nav?.setAttribute('data-progress-ready','true');
      cleanups.push(()=>{progress.kill();nav?.removeAttribute('data-progress-ready');});
      const mm = gsap.matchMedia();
      mm.add({motion:'(prefers-reduced-motion: no-preference)', desktop:'(min-width: 961px) and (pointer: fine)'}, context => {
        if(!context.conditions.motion) return;
        // 首屏入场只执行一次；深链接直接进入正文时不补播首屏。
        if(!window.location.hash && window.scrollY < 100){
          gsap.timeline({defaults:{ease:'power2.out'}})
            .from('.hero-register, .hero-eyebrow', {opacity:0, y:10, duration:0.55, stagger:0.08, clearProps:'opacity,transform'})
            .from('.hero-line', {opacity:0, y:24, duration:0.8, stagger:0.12, clearProps:'opacity,transform'}, 0.12)
            .from('.hero-scene', {scale:1.035, duration:1.6, ease:'power1.out', clearProps:'transform'}, 0)
            .from('.hero-tagline, .hero-cta', {opacity:0, y:12, duration:0.6, stagger:0.08, clearProps:'opacity,transform'}, 0.45)
            .from('.hero-topic-index a', {y:12, duration:0.55, stagger:0.06, clearProps:'transform'}, 0.65);
        }
        // 进入视野后才创建动画，不预先隐藏正文；每个章节仅出现一次。
        context.add('reveal', element => {
          const rows = element.querySelectorAll('.title-row');
          // 分行动效不隐藏正文；读屏名称来自完整标题，动画结束即清理行内变换。
          return gsap.fromTo(rows.length ? rows : element, {y:rows.length ? 22 : 14}, {
            y:0, duration:0.7, stagger:rows.length ? 0.09 : 0, ease:'power2.out', clearProps:'transform'
          });
        });
        document.querySelectorAll('.sec-head, .hero-brand, .optic-study, .work-steps li, .scenario-card, .output-card, .brand-signature').forEach(element => {
          ScrollTrigger.create({trigger:element, start:'top 94%', once:true, onEnter:() => {
            context.reveal(element);
          }});
        });

        let lenis = null;
        let ticker = null;
        const updateVisibility = () => {
          if(!lenis) return;
          if(document.hidden) lenis.stop();
          else lenis.start();
        };
        // 触屏、窄屏、减少动态模式保留原生滚动。锚点始终由浏览器处理。
        if(context.conditions.desktop && Lenis){
          lenis = new Lenis({lerp:0.12, smoothWheel:true, syncTouch:false, anchors:false, stopInertiaOnNavigate:true});
          lenis.on('scroll', ScrollTrigger.update);
          ticker = time => lenis.raf(time * 1000);
          gsap.ticker.add(ticker);
          gsap.ticker.lagSmoothing(0);
          document.addEventListener('visibilitychange', updateVisibility);
          updateVisibility();
        }
        return () => {
          document.removeEventListener('visibilitychange', updateVisibility);
          if(ticker) gsap.ticker.remove(ticker);
          if(lenis) lenis.destroy();
        };
      });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(() => { if(disposePage) refresh(); });
      window.addEventListener('load', refresh, {once:true});
      cleanups.push(() => { window.removeEventListener('load', refresh); mm.revert(); });
    }
    disposePage = () => { cleanups.forEach(cleanup => cleanup()); disposePage = null; };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
  window.addEventListener('pagehide', () => disposePage?.());
  window.addEventListener('pageshow', event => { if(event.persisted) mount(); });
})();
