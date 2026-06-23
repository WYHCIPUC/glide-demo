/* =========================================================
   GLIDE Demo · ECharts 图表（emerald 主调 / cyan 辅调）
   ========================================================= */
(function(){
  if(typeof echarts === 'undefined') return;

  const baseFont = "'Inter','Noto Sans SC',sans-serif";
  const monoFont = "'JetBrains Mono',ui-monospace,Menlo,monospace";

  // 共用：暗色 tooltip
  function tooltip(){
    return {
      backgroundColor:'rgba(5, 10, 12, 0.92)',
      borderColor:'rgba(0, 217, 146, 0.28)',
      borderWidth:1,
      textStyle:{ color:'#f3f7fa', fontSize:12, fontFamily: baseFont },
      extraCssText:'backdrop-filter:blur(8px); box-shadow:0 8px 24px rgba(0,0,0,.5);'
    };
  }

  // —— 1. 关键词态势矩阵 Radar ——
  const radarEl = document.getElementById('chartRadar');
  if(radarEl){
    const chart = echarts.init(radarEl, null, { renderer:'canvas' });
    chart.setOption({
      tooltip: tooltip(),
      radar: {
        center:['50%','52%'], radius:'64%', splitNumber:4,
        axisName:{ color:'#cbd6e0', fontSize:11, fontFamily: baseFont, letterSpacing:0.05 },
        axisLine:{ lineStyle:{ color:'rgba(0, 217, 146, 0.18)' } },
        splitLine:{ lineStyle:{ color:'rgba(0, 217, 146, 0.12)' } },
        splitArea:{
          areaStyle:{
            color:['rgba(0, 217, 146, 0.02)','rgba(0, 217, 146, 0.05)']
          }
        },
        indicator:[
          {name:'边境执法', max:100}, {name:'难民潮', max:100},
          {name:'签证政策', max:100}, {name:'人口走私', max:100},
          {name:'遣返', max:100}, {name:'庇护申请', max:100},
          {name:'边境墙', max:100}, {name:'偷渡', max:100},
          {name:'收容', max:100}, {name:'驱逐', max:100},
          {name:'安置', max:100}, {name:'合规', max:100}
        ]
      },
      series:[{
        type:'radar', symbol:'circle', symbolSize:4,
        lineStyle:{ color:'#00d992', width:1.8, shadowColor:'#00d992', shadowBlur:8 },
        areaStyle:{
          color: new echarts.graphic.RadialGradient(0.5,0.5,0.5,[
            {offset:0, color:'rgba(0, 217, 146, 0.45)'},
            {offset:1, color:'rgba(0, 217, 146, 0.04)'}
          ])
        },
        itemStyle:{ color:'#00d992' },
        data:[
          { name:'本周',  value:[88, 82, 76, 70, 74, 68, 62, 65, 60, 72, 58, 64] },
          { name:'上月',  value:[72, 68, 80, 60, 64, 70, 55, 58, 62, 60, 64, 58] }
        ]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // —— 2. 事件趋势 Stacked Line ——
  const trendEl = document.getElementById('chartTrend');
  if(trendEl){
    const chart = echarts.init(trendEl, null, { renderer:'canvas' });
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
      tooltip: Object.assign(tooltip(), { trigger:'axis', axisPointer:{ type:'line', lineStyle:{ color:'rgba(0,217,146,0.4)' } } }),
      legend:{
        data:['新建事件','跟进中','已关闭'],
        textStyle:{ color:'#a9b3bf', fontSize:11.5, fontFamily: baseFont },
        icon:'roundRect', itemWidth:10, itemHeight:10,
        top:6, right:8
      },
      grid:{ left:38, right:18, top:42, bottom:24 },
      xAxis:{
        type:'category', data:xData, boundaryGap:false,
        axisLabel:{ color:'#6b7785', fontSize:10.5, fontFamily: baseFont, interval:4 },
        axisLine:{ lineStyle:{ color:'rgba(0,217,146,0.15)' } },
        axisTick:{ show:false }
      },
      yAxis:{
        type:'value',
        axisLabel:{ color:'#6b7785', fontSize:10.5, fontFamily: baseFont },
        splitLine:{ lineStyle:{ color:'rgba(0,217,146,0.07)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[
        { name:'新建事件', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:'#00d992', width:1.8, shadowColor:'#00d992', shadowBlur:6 },
          areaStyle:{ color: new echarts.graphic.LinearGradient(0,0,0,1,[
            {offset:0, color:'rgba(0, 217, 146, 0.4)'},
            {offset:1, color:'rgba(0, 217, 146, 0.02)'}
          ])},
          data: seq(1.3, 42, 14)
        },
        { name:'跟进中', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:'#00ffff', width:1.8 },
          data: seq(2.1, 28, 9)
        },
        { name:'已关闭', type:'line', smooth:true, showSymbol:false,
          lineStyle:{ color:'#ffaa00', width:1.6, type:'dashed' },
          data: seq(3.7, 14, 6)
        }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // —— 3. 国家分布热力（横向 Bar）——
  const barEl = document.getElementById('chartBar');
  if(barEl){
    const chart = echarts.init(barEl, null, { renderer:'canvas' });
    const countries = ['美国','墨西哥','德国','法国','英国','土耳其','希腊','意大利','西班牙','波兰','加拿大','澳大利亚','日本','巴西','南非'];
    const values   = [328, 286, 251, 224, 198, 186, 174, 168, 152, 138, 132, 118,  98,  92,  84];
    const max = Math.max(...values);
    chart.setOption({
      tooltip: Object.assign(tooltip(), { trigger:'axis', axisPointer:{ type:'shadow', shadowStyle:{ color:'rgba(0,217,146,0.05)' } } }),
      grid:{ left:64, right:60, top:18, bottom:24 },
      xAxis:{
        type:'value',
        axisLabel:{ color:'#6b7785', fontSize:10.5, fontFamily: baseFont },
        splitLine:{ lineStyle:{ color:'rgba(0,217,146,0.07)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      yAxis:{
        type:'category', data:countries.reverse(),
        axisLabel:{ color:'#cbd6e0', fontSize:12, fontFamily: baseFont },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[{
        type:'bar', barWidth:14,
        itemStyle:{
          borderRadius:[0,4,4,0],
          color: function(p){
            const ratio = p.value / max;
            return new echarts.graphic.LinearGradient(0,0,1,0,[
              {offset:0, color: ratio > 0.7 ? 'rgba(0, 217, 146, 0.2)' : 'rgba(0, 217, 146, 0.12)'},
              {offset:1, color: ratio > 0.7 ? '#00d992' : '#2fd6a1'}
            ]);
          }
        },
        label:{
          show:true, position:'right',
          color:'#a9b3bf', fontSize:10.5, fontFamily: baseFont
        },
        data: values
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // —— 4. 推送渠道占比（环形图） ——
  const ringEl = document.getElementById('chartRing');
  if(ringEl){
    const chart = echarts.init(ringEl, null, { renderer:'canvas' });
    chart.setOption({
      tooltip: tooltip(),
      legend:{
        bottom:0, left:'center', icon:'roundRect', itemWidth:10, itemHeight:10,
        textStyle:{ color:'#a9b3bf', fontSize:11, fontFamily: baseFont }
      },
      series:[{
        type:'pie', radius:['52%','78%'], center:['50%','42%'],
        avoidLabelOverlap:false,
        itemStyle:{ borderColor:'#050507', borderWidth:2, borderRadius:4 },
        label:{ color:'#cbd6e0', fontSize:11, fontFamily: baseFont },
        labelLine:{ lineStyle:{ color:'rgba(0,217,146,0.3)' } },
        data:[
          { value:32, name:'企业微信', itemStyle:{ color:'#00d992' } },
          { value:24, name:'飞书',     itemStyle:{ color:'#00ffff' } },
          { value:18, name:'钉钉',     itemStyle:{ color:'#2fd6a1' } },
          { value:12, name:'Telegram', itemStyle:{ color:'#ffaa00' } },
          { value: 8, name:'Email',    itemStyle:{ color:'#818cf8' } },
          { value: 6, name:'其他',     itemStyle:{ color:'#4cb3d4' } }
        ]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // —— 5. AI 模型调用分布（横向 Bar） ——
  const aiEl = document.getElementById('chartAi');
  if(aiEl){
    const chart = echarts.init(aiEl, null, { renderer:'canvas' });
    chart.setOption({
      tooltip: tooltip(),
      grid:{ left:140, right:30, top:10, bottom:20 },
      xAxis:{
        type:'value',
        axisLabel:{ color:'#6b7785', fontSize:10.5, fontFamily: baseFont },
        splitLine:{ lineStyle:{ color:'rgba(0,217,146,0.07)', type:'dashed' } },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      yAxis:{
        type:'category',
        data:['DeepSeek-V3','智谱 GLM-4','GPT-4o','Claude 3.5','Gemini Pro','通义千问','本地 Ollama'],
        axisLabel:{ color:'#cbd6e0', fontSize:12, fontFamily: baseFont },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[{
        type:'bar', barWidth:16,
        itemStyle:{
          borderRadius:[0,4,4,0],
          color: new echarts.graphic.LinearGradient(0,0,1,0,[
            {offset:0, color:'rgba(0, 217, 146, 0.18)'},
            {offset:1, color:'#00d992'}
          ])
        },
        label:{ show:true, position:'right', color:'#a9b3bf', fontSize:10.5, fontFamily: baseFont },
        data:[4280, 2340, 1280, 920, 540, 380, 220]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }
})();