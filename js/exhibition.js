/* 四专题展陈：脚本缺失时保留全部正文，增强后使用同一份内容。 */
(function(){
  function createExhibit({root,view,onChange=()=>{}}){
    const buttons=Array.from(root.querySelectorAll('[data-topic-target]'));
    const panels=Array.from(root.querySelectorAll('[data-topic]'));
    const controls=root.querySelector('.topic-controls');
    const items=buttons.map(button=>({button,panel:panels.find(panel=>panel.dataset.topic===button.dataset.topicTarget)}));
    if(!controls || !items.length || items.some(item=>!item.panel) || items.length!==panels.length) return ()=>{};
    const remove=[];
    const listen=(node,event,handler)=>{node.addEventListener(event,handler);remove.push(()=>node.removeEventListener(event,handler));};
    const select=(index,{focus=false,animate=true,updateHash=false}={})=>{
      items.forEach(({button,panel},i)=>{
        const active=i===index;
        button.setAttribute('aria-selected',String(active));
        button.tabIndex=active?0:-1;
        panel.hidden=!active;
      });
      if(focus) items[index].button.focus();
      if(updateHash && view.location.hash!==`#${items[index].panel.id}`){
        view.history?.pushState(view.history.state,'',`#${items[index].panel.id}`);
      }
      // 历史导航不播放入场，但也必须通知布局变化。
      onChange(items[index].panel,{animate});
    };
    items.forEach(({button,panel},index)=>{
      button.setAttribute('role','tab');
      button.setAttribute('aria-controls',panel.id);
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby',button.id);
      panel.setAttribute('tabindex','0');
      listen(button,'click',()=>select(index,{updateHash:true}));
      listen(button,'keydown',event=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?items.length-1:
          (index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+items.length)%items.length;
        select(next,{focus:true,updateHash:true});
      });
    });
    const hashIndex=()=>items.findIndex(({panel})=>`#${panel.id}`===view.location.hash);
    root.setAttribute('data-enhanced','true');
    controls.hidden=false;
    select(Math.max(0,hashIndex()),{animate:false});
    listen(view,'hashchange',()=>{
      const index=view.location.hash==='#topics'?0:hashIndex();
      if(index<0) return;
      const wasHidden=items[index].panel.hidden;
      select(index,{animate:false});
      // 浏览器无法提前定位隐藏内容，展开后只补齐该锚点定位。
      if(wasHidden && view.location.hash!=='#topics') items[index].panel.scrollIntoView?.({block:'start',behavior:'instant'});
    });
    return ()=>{
      remove.forEach(fn=>fn());
      panels.forEach(panel=>{panel.hidden=false;['role','aria-labelledby','tabindex'].forEach(key=>panel.removeAttribute(key));});
      root.removeAttribute('data-enhanced');
      controls.hidden=true;
    };
  }
  if(typeof module!=='undefined') module.exports={createExhibit};
  if(typeof window==='undefined' || typeof document==='undefined') return;
  let dispose=null;
  function mount(){
    if(dispose) return;
    const root=document.querySelector('[data-topic-exhibit]');
    if(!root) return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    const panels=root.querySelectorAll('[data-topic]');
    const reset=createExhibit({root,view:window,onChange:(panel,{animate})=>{
      window.gsap?.killTweensOf(panels);
      window.gsap?.set(panels,{clearProps:'transform,opacity'});
      if(animate && !reduce.matches) window.gsap?.fromTo(panel,{y:12,opacity:0.65},{y:0,opacity:1,duration:0.35,ease:'power2.out',clearProps:'transform,opacity'});
      window.ScrollTrigger?.refresh();
    }});
    const refresh=()=>window.ScrollTrigger?.refresh();
    document.addEventListener('toggle',refresh,true);
    dispose=()=>{reset();window.gsap?.killTweensOf(panels);window.gsap?.set(panels,{clearProps:'transform,opacity'});document.removeEventListener('toggle',refresh,true);dispose=null;};
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
  window.addEventListener('pagehide',()=>dispose?.());
  window.addEventListener('pageshow',event=>{if(event.persisted) mount();});
})();
