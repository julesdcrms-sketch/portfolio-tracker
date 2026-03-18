let pieChart=null;
function buildPie(){
  const T=tot();
  const geo=A.filter(a=>a.cat==="GÉO").reduce((s,a)=>s+val(a),0);
  const them=A.filter(a=>a.cat==="THÉM.").reduce((s,a)=>s+val(a),0);
  const alt=A.filter(a=>a.cat==="ALT.").reduce((s,a)=>s+val(a),0);
  const pcts=[geo/T*100,them/T*100,alt/T*100];
  document.getElementById('pie-legend').innerHTML=[
    {l:"Core géo",  c:"#3a6f9e",p:pcts[0]},
    {l:"Thématiques",c:"#5a5a52",p:pcts[1]},
    {l:"Alternatifs",c:"#b4b2a9",p:pcts[2]},
  ].map(x=>`<div style="display:flex;align-items:center;gap:8px;font-size:12px">
    <span style="width:9px;height:9px;border-radius:2px;background:${x.c};display:inline-block;flex-shrink:0"></span>
    <span style="flex:1;color:var(--text3)">${x.l}</span>
    <span class="mono">${x.p.toFixed(1)}%</span>
  </div>`).join('');
  if(pieChart)pieChart.destroy();
  pieChart=new Chart(document.getElementById('pie'),{
    type:'doughnut',
    data:{labels:['Core géo','Thématiques','Alternatifs'],datasets:[{data:pcts,backgroundColor:['#3a6f9e','#5a5a52','#b4b2a9'],borderColor:'#fff',borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:true,cutout:'68%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a18',titleColor:'#e8e6de',bodyColor:'#9a9890',callbacks:{label:ctx=>` ${ctx.parsed.toFixed(1)}%`}}}}
  });
}

let geoBuilt=false;
function buildGeoMap(){
  if(geoBuilt)return;
  geoBuilt=true;
  const wrap=document.getElementById('geo-map-wrap');
  wrap.innerHTML='';
  const W=wrap.offsetWidth||640,H=260;
  const svg=d3.select('#geo-map-wrap').append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').style('background','#eceae5').style('border-radius','10px');
  const proj=d3.geoNaturalEarth1().scale(W/5.8).translate([W/2,H/2+10]);
  const path=d3.geoPath(proj);
  const numToRegion={};
  GEO_DATA.forEach(g=>g.ids.forEach(id=>{numToRegion[id]=g;}));
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world=>{
    svg.selectAll('path').data(topojson.feature(world,world.objects.countries).features).join('path').attr('d',path).attr('fill',d=>{const r=numToRegion[+d.id];return r?r.col:'#d3d1c7';}).attr('stroke','#eceae5').attr('stroke-width',0.4);
  }).catch(()=>{
    wrap.innerHTML='<div style="height:260px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text4)">Carte non disponible hors connexion</div>';
  });
  document.getElementById('geo-bars').innerHTML=GEO_DATA.map(g=>`
    <div class="bench-row"><div class="bench-name">${g.region}</div><div class="bench-track"><div class="bench-fill" style="width:${g.pct}%;background:${g.col}"></div></div><div class="bench-val mono ${g.pct>50?'dn':''}">${g.pct}%</div></div>`).join('');
  document.getElementById('geo-legend').innerHTML=GEO_DATA.map(g=>`
    <div class="geo-leg-item"><span class="geo-leg-dot" style="background:${g.col}"></span>${g.region} ${g.pct}%</div>`).join('')+'<div class="geo-leg-item"><span class="geo-leg-dot" style="background:#d3d1c7"></span>Non couvert</div>';
}

let simChart=null;
function buildSimChart(labels,vals,invs){
  if(simChart)simChart.destroy();
  simChart=new Chart(document.getElementById('sim-chart'),{
    type:'line',
    data:{labels,datasets:[
      {label:'Valeur', data:vals,borderColor:'#1a1a18',borderWidth:1.5,pointRadius:0,fill:true,backgroundColor:'rgba(26,26,24,0.04)',tension:.4},
      {label:'Investi',data:invs,borderColor:'#d3d1c7',borderWidth:1,pointRadius:0,fill:false,borderDash:[4,4]},
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,backgroundColor:'#1a1a18',titleColor:'#e8e6de',bodyColor:'#9a9890',callbacks:{label:ctx=>' €'+ctx.parsed.y.toLocaleString('fr-FR')}}},
      scales:{
        x:{grid:{display:false},ticks:{color:'#b0aea9',font:{size:10}},border:{display:false}},
        y:{grid:{color:'rgba(0,0,0,0.03)'},ticks:{color:'#b0aea9',font:{size:10},callback:v=>'€'+Math.round(v/1000)+'k'},border:{display:false}}
      }
    }
  });
}
