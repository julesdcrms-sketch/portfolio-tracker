function buildKPIs(){
  const T=tot(),totalPnl=A.reduce((s,a)=>s+pnl(a),0),invested=T-totalPnl;
  const pvPct=invested>0?(totalPnl/invested*100).toFixed(2):'0.00';
  const usExp=calcUSExp();
  document.getElementById('kpis').innerHTML=`
    <div class="kpi"><div class="kpi-l">Valeur totale</div><div class="kpi-v mono">€${T.toFixed(2)}</div><div class="kpi-s">Portefeuille global</div></div>
    <div class="kpi"><div class="kpi-l">Investi total</div><div class="kpi-v mono">€${invested.toFixed(2)}</div><div class="kpi-s">Capital déployé</div></div>
    <div class="kpi"><div class="kpi-l">Plus-value</div><div class="kpi-v mono ${totalPnl>=0?'up':'dn'}">${fmtEur(totalPnl)}</div><div class="badge ${totalPnl>=0?'bg':'br'}">${totalPnl>=0?'▲':'▼'} ${totalPnl>=0?'+':''}${pvPct}%</div></div>
    <div class="kpi"><div class="kpi-l">Exposition US</div><div class="kpi-v mono" style="color:var(--amber)">~${usExp}%</div><div class="badge ba">⚠ Surveiller</div></div>`;
}

function buildAllocBars(){
  const T=tot();
  const cats=[{n:"Core géo",cat:"GÉO",cible:60,col:"var(--col-geo)"},{n:"Thématiques",cat:"THÉM.",cible:15,col:"var(--col-them)"},{n:"Alternatifs",cat:"ALT.",cible:25,col:"var(--col-alt)"}].map(c=>({...c,pct:A.filter(a=>a.cat===c.cat).reduce((s,a)=>s+val(a)/T*100,0)}));
  document.getElementById('alloc-bars').innerHTML=cats.map(c=>{
    const e=(c.pct-c.cible).toFixed(1),ep=parseFloat(e)>=0;
    return`<div class="alloc-row"><div class="alloc-name">${c.n}</div><div class="alloc-track"><div class="alloc-fill" style="width:${Math.min(c.pct,100)}%;background:${c.col};opacity:.6"></div><div class="alloc-tgt" style="left:${c.cible}%"></div></div><div class="alloc-pct">${c.pct.toFixed(1)}%</div><div class="alloc-sig ${ep?'dn':'up'}" style="font-size:10px">${ep?'⬇ réduire':'⬆ renforcer'}</div></div>`;
  }).join('');
}

function buildPositions(){
  const T=tot();
  document.getElementById('pos-body').innerHTML=A.filter(a=>val(a)>0).map(a=>{
    const reel=val(a)/T*100,ecart=(reel-a.cible).toFixed(1),ep=parseFloat(ecart)>=0;
    const c=cost(a),perfPct=c>0?((val(a)-c)/c*100).toFixed(1):'—',perfEur=c>0?val(a)-c:0;
    const fw=Math.min(reel/50*100,100),tw=Math.min(a.cible/50*100,100);
    return`<tr><td><div class="asset-cell"><span class="dot" style="background:${a.col}"></span><span class="asset-name">${a.n}</span><span class="asset-ticker">${a.tk}</span><span class="env-pill ${a.env.toLowerCase()}">${a.env}</span></div></td><td class="mono">${fmtParts(a)}</td><td class="mono">${fmtPx(a)}</td><td class="mono">€${val(a).toFixed(2)}</td><td class="mono ${parseFloat(perfPct)>=0?'up':'dn'}">${perfPct!=='—'?(parseFloat(perfPct)>=0?'+':'')+perfPct+'%':'—'}</td><td class="mono ${perfEur>=0?'up':'dn'}">${c>0?fmtEur(perfEur):'—'}</td><td class="mono">${reel.toFixed(1)}%</td><td><div class="bar-w"><span style="font-size:10px;color:var(--text5);min-width:20px">${a.cible}%</span><div class="bar-t"><div class="bar-f" style="width:${fw}%;background:${a.col}"></div><div class="bar-tgt" style="left:${tw}%"></div></div><span class="mono" style="font-size:11px;min-width:30px;text-align:right;color:${ep?'var(--red)':'var(--green)'}">${ep?'+':''}${ecart}%</span></div></td></tr>`;
  }).join('');
}

function buildRisk(){
  const usExp=calcUSExp(),missing=A.filter(a=>val(a)===0&&a.cible>0).length;
  const euPct=A.filter(a=>a.cat==="GÉO").reduce((s,a)=>s+val(a)/tot()*100,0);
  const score=Math.max(1,Math.min(10,10-Math.round((usExp-50)/5)-missing));
  const sc=score<5?'var(--red)':score<7?'var(--amber)':'var(--green)';
  document.getElementById('risk-cards').innerHTML=`
    <div class="risk-c"><div class="risk-l">Concentration US</div><div class="risk-v dn">${usExp}%</div><div class="risk-s">Recommandé &lt;50%</div></div>
    <div class="risk-c"><div class="risk-l">Score diversif.</div><div class="risk-v" style="color:${sc}">${score}/10</div><div class="risk-s">Calculé en direct</div></div>
    <div class="risk-c"><div class="risk-l">Volatilité est.</div><div class="risk-v">~14%</div><div class="risk-s">Annualisée hist.</div></div>`;
  const alerts=[];
  if(usExp>60)alerts.push({c:'a-d',m:`⚑ Surexposition US à ${usExp}% — seuil recommandé &lt;50%`});
  if(missing>0)alerts.push({c:'a-w',m:`⚑ ${missing} position(s) non initiées — Japon et Obligataire manquants`});
  alerts.push({c:'a-w',m:'⚑ MSCI World + S&P 500 + Nasdaq = chevauchement US ~65–70% réel'});
  if(euPct<10)alerts.push({c:'a-w',m:`⚑ Europe sous-représentée (${euPct.toFixed(1)}%) — cible 15%+`});
  alerts.push({c:'a-o',m:'✓ ETFs capitalisants — aucun frottement fiscal annuel'});
  document.getElementById('risk-alerts').innerHTML=alerts.map(a=>`<div class="ab ${a.c}">${a.m}</div>`).join('');
}

function buildBench(){
  const T=tot(),totalPnl=A.reduce((s,a)=>s+pnl(a),0),portPct=T>0?(totalPnl/(T-totalPnl)*100):0;
  const benches=[{n:'Mon portfolio',pct:portPct,col:'#1a1a18',bold:true},{n:'MSCI World',pct:1.2,col:'#3a6f9e'},{n:'S&P 500',pct:0.6,col:'#7aa8c8'},{n:'CAC 40',pct:-0.3,col:'#b4b2a9'},{n:'Bitcoin',pct:0.0,col:'#e8a022'}];
  document.getElementById('bench-bars').innerHTML=benches.map(b=>`<div class="bench-row"><div class="bench-name" style="${b.bold?'font-weight:500':''}">${b.n}</div><div class="bench-track"><div class="bench-fill" style="width:${Math.max(Math.abs(b.pct)*6,1)}%;background:${b.col};opacity:${b.bold?1:.55}"></div></div><div class="bench-val mono ${b.pct>=0?'up':'dn'}">${b.pct>=0?'+':''}${b.pct.toFixed(2)}%</div></div>`).join('');
}

function buildAdvice(){
  const T=tot(),dca=100;
  document.getElementById('advice-dca-ref').textContent='€'+dca;
  const buys=A.filter(a=>(val(a)/T*100-a.cible)<-3).sort((x,y)=>(val(x)/T*100-x.cible)-(val(y)/T*100-y.cible));
  const pauses=A.filter(a=>(val(a)/T*100-a.cible)>5);
  const totalGap=buys.reduce((s,a)=>s+Math.abs(val(a)/T*100-a.cible),0);
  let html='';
  buys.forEach(a=>{const ecart=val(a)/T*100-a.cible,amount=totalGap>0?Math.round(Math.abs(ecart)/totalGap*dca):0;html+=`<div class="adv-row"><div class="adv-ic" style="background:var(--green-bg);color:var(--green)">↑</div><div style="flex:1"><div class="adv-t">Renforcer ${a.n}</div><div class="adv-s">Écart ${ecart.toFixed(1)}% · Cible ${a.cible}% · Actuel ${(val(a)/T*100).toFixed(1)}%</div></div><div class="adv-amt up">+€${amount}</div></div>`;});
  pauses.forEach(a=>{const ecart=val(a)/T*100-a.cible;html+=`<div class="adv-row"><div class="adv-ic" style="background:var(--red-bg);color:var(--red)">—</div><div style="flex:1"><div class="adv-t">Pause ${a.n}</div><div class="adv-s">Surpondéré +${ecart.toFixed(1)}% · Ne pas renforcer</div></div><div class="adv-amt dn">Pause</div></div>`;});
  document.getElementById('advice-list').innerHTML=html||'<div style="font-size:12px;color:var(--text4);padding:10px 0">Portfolio équilibré — aucun rééquilibrage urgent.</div>';
}

function buildFisc(){
  const peaPnl=A.filter(a=>a.env==='PEA').reduce((s,a)=>s+pnl(a),0);
  const ctoPnl=A.filter(a=>a.env==='CTO').reduce((s,a)=>s+pnl(a),0);
  const peaPS=Math.max(0,peaPnl*0.172),ctoTax=Math.max(0,ctoPnl*0.30);
  document.getElementById('fisc-pea-pv').textContent=fmtEur(peaPnl);
  document.getElementById('fisc-pea-ps').textContent='€'+peaPS.toFixed(2);
  document.getElementById('fisc-pea-net').textContent=fmtEur(peaPnl-peaPS);
  document.getElementById('fisc-cto-pv').textContent=fmtEur(ctoPnl);
  document.getElementById('fisc-cto-tax').textContent='€'+ctoTax.toFixed(2);
  document.getElementById('fisc-cto-net').textContent=fmtEur(ctoPnl-ctoTax);
  document.getElementById('fisc-total-tax').textContent='€'+(peaPS+ctoTax).toFixed(2);
  calcFisc();
}

function calcFisc(){
  const amt=+document.getElementById('f-amount').value,env=document.getElementById('f-env').value;
  document.getElementById('f-amt-v').textContent='€'+amt;
  const T=tot(),totalPnl=A.reduce((s,a)=>s+pnl(a),0),ratio=T>0?totalPnl/T:0;
  const pvAmt=amt*ratio,taxRate=env==='pea'?0.172:0.30,tax=Math.max(0,pvAmt*taxRate);
  document.getElementById('f-pv').textContent=fmtEur(pvAmt);
  document.getElementById('f-tax').textContent='€'+tax.toFixed(2);
  document.getElementById('f-net').textContent=fmtEur(pvAmt-tax);
}

function sim(){
  const cap=+document.getElementById('s-cap').value,dca=+document.getElementById('s-dca').value;
  const rate=+document.getElementById('s-rate').value/100,yrs=+document.getElementById('s-yr').value;
  document.getElementById('sv-cap').textContent='€'+cap;
  document.getElementById('sv-dca').textContent='€'+dca;
  document.getElementById('sv-rate').textContent=document.getElementById('s-rate').value+'%';
  document.getElementById('sv-yr').textContent=yrs+' ans';
  const m=rate/12,labels=[],vals=[],invs=[];
  let v=cap,inv=cap;
  for(let y=0;y<=yrs;y++){labels.push(y===0?'Auj.':y+'a');vals.push(Math.round(v));invs.push(Math.round(inv));for(let i=0;i<12;i++)v=v*(1+m)+dca;inv+=dca*12;}
  document.getElementById('sv-final').textContent='€'+Math.round(v).toLocaleString('fr-FR');
  document.getElementById('sv-inv').textContent='€'+Math.round(cap+dca*yrs*12).toLocaleString('fr-FR');
  document.getElementById('sv-gain').textContent='€'+Math.round(v-(cap+dca*yrs*12)).toLocaleString('fr-FR');
  buildSimChart(labels,vals,invs);
}

function buildNews(){
  const fmt=items=>items.map(i=>`<div class="news-i"><div class="news-src">${i.src}</div><div><div class="news-t">${i.t}</div><div class="news-time">${i.time}</div></div></div>`).join('');
  document.getElementById('etf-news').innerHTML=fmt(ETF_NEWS);
  document.getElementById('macro-news').innerHTML=fmt(MACRO_NEWS);
}

function saveNote(){localStorage.setItem('pf_note',document.getElementById('note-input').value);}
function loadNote(){const s=localStorage.getItem('pf_note');if(s)document.getElementById('note-input').value=s;}
function insertTag(tag){const ta=document.getElementById('note-input'),pos=ta.selectionStart;ta.value=ta.value.substring(0,pos)+'['+tag+'] '+ta.value.substring(pos);saveNote();}
function loadEntries(){
  const s=localStorage.getItem('pf_entries');
  const entries=s?JSON.parse(s):[{date:'26 fév.',text:'Bitcoin +€10 · Solana +€10 — premières positions crypto.'},{date:'28 fév.',text:'Portfolio initialisé — DCA mensuel lancé sur MSCI World.'}];
  document.getElementById('note-entries').innerHTML=entries.map(e=>`<div class="note-entry"><div class="note-date">${e.date}</div><div class="note-text">${e.text}</div></div>`).join('');
}
function addNoteEntry(){
  const ta=document.getElementById('note-input'),text=ta.value.trim();if(!text)return;
  const s=localStorage.getItem('pf_entries'),entries=s?JSON.parse(s):[];
  const now=new Date(),d=now.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  entries.unshift({date:d,text});localStorage.setItem('pf_entries',JSON.stringify(entries));ta.value='';saveNote();loadEntries();
}

function buildMajSelect(){
  document.getElementById('maj-sel').innerHTML=A.map(a=>`<option value="${a.id}">${a.n} — ${a.tk} (${a.env})</option>`).join('');
  document.getElementById('maj-date').value=new Date().toISOString().split('T')[0];
}
function buildMajList(){
  document.getElementById('maj-list').innerHTML=A.map(a=>`<div class="ali"><span style="width:7px;height:7px;border-radius:50%;background:${a.col};flex-shrink:0;display:inline-block"></span><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><span class="ali-name">${a.n}</span><span class="asset-ticker">${a.tk}</span><span class="env-pill ${a.env.toLowerCase()}">${a.env}</span></div><div class="ali-meta">${fmtParts(a)} parts · PRU ${fmtPx(a)} · Valeur €${val(a).toFixed(2)}</div></div><div style="display:flex;gap:7px;flex-shrink:0"><button class="btn-g" style="padding:5px 11px;font-size:11px" onclick="quickOp(${a.id},'buy')">Achat</button><button class="btn-r" style="padding:5px 11px;font-size:11px" onclick="quickOp(${a.id},'sell')">Vente</button></div></div>`).join('');
}
function quickOp(id,action){document.getElementById('maj-sel').value=id;document.getElementById('maj-action').value=action;document.getElementById('maj-sel').scrollIntoView({behavior:'smooth',block:'center'});}
function validateOp(){
  const id=+document.getElementById('maj-sel').value,action=document.getElementById('maj-action').value;
  const parts=+document.getElementById('maj-parts').value,price=+document.getElementById('maj-price').value;
  const perfV=document.getElementById('maj-perf').value,fb=document.getElementById('maj-feedback');
  if(parts<=0||price<=0){fb.style.display='block';fb.style.color='var(--red)';fb.textContent='Merci de renseigner un nombre de parts et un prix valides.';return;}
  const a=A.find(x=>x.id===id);if(!a)return;
  if(action==='buy'){const newParts=a.parts+parts,newCost=cost(a)+parts*price;a.pru=newCost/newParts;a.parts=newParts;a.px=price;}
  else{if(parts>a.parts){fb.style.display='block';fb.style.color='var(--red)';fb.textContent='Impossible : tu essaies de vendre plus de parts que disponibles.';return;}a.parts-=parts;a.px=price;}
  if(perfV!=='')a.manualPerf=+perfV;
  saveAssets();rebuildAll();resetForm();
  fb.style.display='block';fb.style.color='var(--green)';fb.textContent='✓ '+a.n+' mis à jour.';setTimeout(()=>{fb.style.display='none';},3000);
}
function resetForm(){document.getElementById('maj-parts').value='';document.getElementById('maj-price').value='';document.getElementById('maj-perf').value='';}
function addAsset(){
  const name=document.getElementById('new-name').value.trim(),ticker=document.getElementById('new-ticker').value.trim().toUpperCase();
  const cat=document.getElementById('new-cat').value,env=document.getElementById('new-env').value;
  const cible=+document.getElementById('new-cible').value||0,fb=document.getElementById('new-feedback');
  if(!name){fb.style.display='block';fb.style.color='var(--red)';fb.textContent='Merci de renseigner un nom.';return;}
  const colMap={'GÉO':'#3a6f9e','THÉM.':'#5a5a52','ALT.':'#b4b2a9'};
  A.push({id:Math.max(...A.map(a=>a.id))+1,n:name,tk:ticker||'—',cat,env,parts:0,px:0,pru:0,cible,col:colMap[cat],manualPerf:null});
  saveAssets();rebuildAll();
  document.getElementById('new-name').value='';document.getElementById('new-ticker').value='';document.getElementById('new-cible').value='';
  fb.style.display='block';fb.style.color='var(--green)';fb.textContent='✓ '+name+' ajouté.';setTimeout(()=>{fb.style.display='none';},3000);
}

async function refreshPrices(){
  const btn=document.getElementById('refresh-btn'),spin=document.getElementById('spin-icon');
  btn.classList.add('loading');spin.classList.add('active');
  const tickers=[{tk:'IWDA.AS',id:1},{tk:'SXR8.DE',id:2},{tk:'MEUD.PA',id:3},{tk:'EIMI.L',id:5},{tk:'CNDX.L',id:6},{tk:'ADEF.PA',id:7}];
  for(const t of tickers){try{const url=`https://query1.finance.yahoo.com/v8/finance/chart/${t.tk}?interval=1d&range=1d`,proxy=`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,res=await fetch(proxy,{signal:AbortSignal.timeout(5000)});if(!res.ok)continue;const data=await res.json(),price=data?.chart?.result?.[0]?.meta?.regularMarketPrice;if(price&&price>0){const a=A.find(x=>x.id===t.id);if(a)a.px=price;}}catch(e){}}
  try{const cgUrl='https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=eur',proxy=`https://api.allorigins.win/raw?url=${encodeURIComponent(cgUrl)}`,res=await fetch(proxy,{signal:AbortSignal.timeout(5000)});if(res.ok){const data=await res.json();const btc=A.find(x=>x.id===9);if(btc&&data.bitcoin)btc.px=data.bitcoin.eur;const sol=A.find(x=>x.id===10);if(sol&&data.solana)sol.px=data.solana.eur;}}catch(e){}
  saveAssets();rebuildAll();
  const now=new Date();document.getElementById('last-update').textContent='MAJ '+now.toLocaleDateString('fr-FR')+' '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  btn.classList.remove('loading');spin.classList.remove('active');spin.textContent='✓';setTimeout(()=>{spin.textContent='↻';},2500);
}

function go(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  el.classList.add('active');
  if(id==='analyse'){buildRisk();buildBench();buildGeoMap();}
}

function rebuildAll(){buildKPIs();buildAllocBars();buildPie();buildPositions();buildAdvice();buildFisc();buildMajSelect();buildMajList();buildRisk();buildBench();}

document.addEventListener('DOMContentLoaded',()=>{
  rebuildAll();buildNews();loadNote();loadEntries();sim();calcFisc();
  const now=new Date();document.getElementById('last-update').textContent='MAJ '+now.toLocaleDateString('fr-FR');
});
