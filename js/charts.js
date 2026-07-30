/* =========================================================
   GLIDE Demo · ECharts 图表（emerald 主调 / cyan 辅调）
   ========================================================= */
(function(){
  if(typeof echarts === 'undefined') return;

  const baseFont = "'Inter','Noto Sans SC',sans-serif";
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

  // —— 1. 事件证据丰富度 Radar（演示数据） ——
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
          {name:'跨源覆盖', max:100}, {name:'地点字段', max:100},
          {name:'中文摘要', max:100}, {name:'实体关系', max:100},
          {name:'人工复核', max:100}, {name:'生命周期', max:100}
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
          { name:'丰富事件', value:[88, 92, 96, 76, 72, 90] },
          { name:'待补充事件', value:[42, 64, 80, 28, 20, 54] }
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

  // —— 4. 信息来源构成（环形图，演示数据） ——
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
          { value:42, name:'热榜平台', itemStyle:{ color:'#00d992' } },
          { value:38, name:'RSS',      itemStyle:{ color:'#00ffff' } },
          { value:12, name:'OSINT',    itemStyle:{ color:'#ffaa00' } },
          { value: 8, name:'人工导入', itemStyle:{ color:'#818cf8' } }
        ]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // —— 5. 指标语义分层（等长仅表示四类独立口径） ——
  const aiEl = document.getElementById('chartAi');
  if(aiEl){
    const chart = echarts.init(aiEl, null, { renderer:'canvas' });
    chart.setOption({
      tooltip: Object.assign(tooltip(), {
        formatter: function(params){
          const descriptions = {
            '报道热度':'媒体报道篇数、频次与来源覆盖',
            '事件活跃度':'去重事件的新增、跟进与生命周期变化',
            'AI 推断风险':'模型基于证据给出的风险分级，带不确定性',
            '真实迁移规模':'需由官方统计、现场数据或可信实测支撑'
          };
          return `<strong>${params.name}</strong><br>${descriptions[params.name]}`;
        }
      }),
      grid:{ left:126, right:30, top:10, bottom:20 },
      xAxis:{
        type:'value', max:100, show:false
      },
      yAxis:{
        type:'category',
        data:['真实迁移规模','AI 推断风险','事件活跃度','报道热度'],
        axisLabel:{ color:'#cbd6e0', fontSize:12, fontFamily: baseFont },
        axisLine:{ show:false }, axisTick:{ show:false }
      },
      series:[{
        type:'bar', barWidth:22,
        itemStyle:{
          borderRadius:[0,6,6,0],
          color: function(params){
            return ['#4cb3d4','#ffaa00','#00ffff','#00d992'][params.dataIndex];
          },
          opacity:0.78
        },
        label:{
          show:true, position:'insideRight', color:'#050507', fontWeight:700,
          fontSize:11, fontFamily:baseFont, formatter:'独立口径'
        },
        data:[100,100,100,100]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }
})();
