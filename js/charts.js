/* =========================================================
   境鉴展厅 · ECharts 图表（复用品牌色，不改动演示数据）
   ========================================================= */
(function(){
  if(typeof echarts === 'undefined') return;

  const baseFont = getComputedStyle(document.body).fontFamily;
  const tokens = getComputedStyle(document.documentElement);
  const color = name => tokens.getPropertyValue(name).trim();
  const palette = {accent:color('--chart-accent'), secondary:color('--accent-cyan'),
    blue:color('--chart-secondary'), gold:color('--chart-gold'), text:color('--chart-text'),
    muted:color('--chart-muted'), silver:color('--brand-silver'), background:color('--bg-carbon'),
    space:color('--brand-space'), neutral:color('--tag-purple')};
  const cyan = opacity => `rgba(${color('--chart-accent-rgb')},${opacity})`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chartInstances = [];
  function initChart(element){
    element.querySelector('[data-chart-fallback]')?.remove();
    const chart = echarts.init(element, null, { renderer:'canvas' });
    chart.setOption({ animation:!reducedMotion, color:[palette.accent,palette.secondary,palette.gold,palette.neutral] });
    chartInstances.push(chart);
    return chart;
  }
  window.addEventListener('resize', () => chartInstances.forEach(chart => chart.resize()));
  window.addEventListener('pageshow', () => chartInstances.forEach(chart => chart.resize()));
  // 共用：暗色 tooltip
  function tooltip(){
    return {
      backgroundColor:palette.background,
      borderColor:cyan(0.28),
      borderWidth:1,
      textStyle:{ color:palette.silver, fontSize:12, fontFamily: baseFont },
      extraCssText:`backdrop-filter:blur(8px); box-shadow:0 8px 24px ${palette.space};`
    };
  }

  // —— 1. 事件证据丰富度 Radar（演示数据） ——
  const radarEl = document.getElementById('chartRadar');
  if(radarEl){
    const chart = initChart(radarEl);
    chart.setOption({
      tooltip: tooltip(),
      radar: {
        center:['50%','52%'], radius:'64%', splitNumber:4,
        axisName:{ color:palette.text, fontSize:11, fontFamily: baseFont, letterSpacing:0.05 },
        axisLine:{ lineStyle:{ color:cyan(0.18) } },
        splitLine:{ lineStyle:{ color:cyan(0.12) } },
        splitArea:{
          areaStyle:{
            color:[cyan(0.02),cyan(0.05)]
          }
        },
        indicator:[
          {name:'跨源覆盖', max:100}, {name:'地点字段', max:100},
          {name:'中文摘要', max:100}, {name:'实体关系', max:100},
          {name:'时间字段', max:100}, {name:'生命周期', max:100}
        ]
      },
      series:[{
        type:'radar', symbol:'circle', symbolSize:4,
        lineStyle:{ color:palette.accent, width:1.8, shadowColor:palette.accent, shadowBlur:8 },
        areaStyle:{
          color: new echarts.graphic.RadialGradient(0.5,0.5,0.5,[
            {offset:0, color:cyan(0.45)},
            {offset:1, color:cyan(0.04)}
          ])
        },
        itemStyle:{ color:palette.accent },
        data:[
          { name:'丰富事件', value:[88, 92, 96, 76, 72, 90] },
          { name:'待补充事件', value:[42, 64, 80, 28, 20, 54] }
        ]
      }]
    });
  }

  // —— 2. 事件趋势 Stacked Line ——
  const trendEl = document.getElementById('chartTrend');
  if(trendEl){
    const chart = initChart(trendEl);
    const days = 30;
    const xData = Array.from({length:days}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (days-1-i));
      return (d.getMonth()+1) + '/' + d.getDate();
    });
    function seq(seed, base, amp){
      return Array.from({length:days}, (_,i) => {
        const v = Math.sin(seed + i*0.7) * amp + Math.cos(seed*1.3 + i*0.4) * amp*0.6 + base;
        return Math.max(0, Math.round(v));
      });
    }
    chart.setOption({
      tooltip: Object.assign(tooltip(), { trigger:'axis', axisPointer:{ type:'line', lineStyle:{ color:cyan(0.4) } } }),
      legend:{
        data:['新建事件','跟进中','已关闭'],
        textStyle:{ color:palette.text, fontSize:11.5, fontFamily: baseFont },
        icon:'roundRect', itemWidth:10, itemHeight:10,
        top:6, right:8
      },
      grid:{ left:38, right:18, top:42, bottom:24 },
      xAxis:{
        type:'category', data:xData, boundaryGap:false,
        axisLabel:{ color:palette.muted, fontSize:10.5, fontFamily: baseFont, interval:4 },
        axisLine:{ lineStyle:{ color:cyan(0.15) } },
        axisTick:{ show:false }
      },
      yAxis:{
        type:'value',
        axisLabel:{ color:palette.muted, fontSize:10.5, fontFamily: baseFont },
        splitLine:{ lineStyle:{ color:cyan(0.07), type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[
        { name:'新建事件', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:palette.accent, width:1.8, shadowColor:palette.accent, shadowBlur:6 },
          areaStyle:{ color: new echarts.graphic.LinearGradient(0,0,0,1,[
            {offset:0, color:cyan(0.4)},
            {offset:1, color:cyan(0.02)}
          ])},
          data: seq(1.3, 42, 14)
        },
        { name:'跟进中', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:palette.secondary, width:1.8 },
          data: seq(2.1, 28, 9)
        },
        { name:'已关闭', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:palette.gold, width:1.6, type:'dashed' },
          data: seq(3.7, 14, 6)
        }
      ]
    });
  }

  // —— 3. 国家分布热力（横向 Bar）——
  const barEl = document.getElementById('chartBar');
  if(barEl){
    const chart = initChart(barEl);
    const countries = ['美国','墨西哥','德国','法国','英国','土耳其','希腊','意大利','西班牙','波兰','加拿大','澳大利亚','日本','巴西','南非'];
    const values   = [328, 286, 251, 224, 198, 186, 174, 168, 152, 138, 132, 118,  98,  92,  84];
    const max = Math.max(...values);
    chart.setOption({
      tooltip: Object.assign(tooltip(), { trigger:'axis', axisPointer:{ type:'shadow', shadowStyle:{ color:cyan(0.05) } } }),
      grid:{ left:64, right:60, top:18, bottom:24 },
      xAxis:{
        type:'value',
        axisLabel:{ color:palette.muted, fontSize:10.5, fontFamily: baseFont },
        splitLine:{ lineStyle:{ color:cyan(0.07), type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      yAxis:{
        type:'category', data:countries.reverse(),
        axisLabel:{ color:palette.text, fontSize:12, fontFamily: baseFont },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[{
        type:'bar', barWidth:14,
        itemStyle:{
          borderRadius:[0,4,4,0],
          color: function(p){
            const ratio = p.value / max;
            return new echarts.graphic.LinearGradient(0,0,1,0,[
              {offset:0, color: ratio > 0.7 ? cyan(0.2) : cyan(0.12)},
              {offset:1, color: ratio > 0.7 ? palette.accent : palette.blue}
            ]);
          }
        },
        label:{
          show:true, position:'right',
          color:palette.text, fontSize:10.5, fontFamily: baseFont
        },
        data: values.slice().reverse()
      }]
    });
  }

  // —— 4. 信息来源构成（环形图，演示数据） ——
  const ringEl = document.getElementById('chartRing');
  if(ringEl){
    const chart = initChart(ringEl);
    chart.setOption({
      tooltip: tooltip(),
      legend:{
        bottom:0, left:'center', icon:'roundRect', itemWidth:10, itemHeight:10,
        textStyle:{ color:palette.text, fontSize:11, fontFamily: baseFont }
      },
      series:[{
        type:'pie', radius:['52%','78%'], center:['50%','42%'],
        avoidLabelOverlap:false,
        itemStyle:{ borderColor:palette.space, borderWidth:2, borderRadius:4 },
        label:{ color:palette.text, fontSize:11, fontFamily: baseFont },
        labelLine:{ lineStyle:{ color:cyan(0.3) } },
        data:[
          { value:42, name:'热榜平台', itemStyle:{ color:palette.accent } },
          { value:38, name:'RSS',      itemStyle:{ color:palette.secondary } },
          { value:12, name:'OSINT',    itemStyle:{ color:palette.gold } },
          { value: 8, name:'人工导入', itemStyle:{ color:palette.neutral } }
        ]
      }]
    });
  }
})();
