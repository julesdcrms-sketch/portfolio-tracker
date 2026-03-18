if(sessionStorage.getItem('pf_auth')!=='ok') window.location.href='index.html';
function logout(){sessionStorage.removeItem('pf_auth');window.location.href='index.html';}

const DEFAULT_ASSETS=[
  {id:1, n:"MSCI World",    tk:"IWDA", cat:"GÉO",  env:"PEA", parts:5.20,    px:44.10,  pru:43.60, cible:25, col:"#3a6f9e", manualPerf:null},
  {id:2, n:"S&P 500",       tk:"SXR8", cat:"GÉO",  env:"PEA", parts:0.83,    px:61.51,  pru:60.90, cible:10, col:"#3a6f9e", manualPerf:null},
  {id:3, n:"Euro Stoxx 600",tk:"MEUD", cat:"GÉO",  env:"PEA", parts:1.10,    px:17.74,  pru:18.10, cible:10, col:"#3a6f9e", manualPerf:null},
  {id:4, n:"CAC 40",        tk:"—",    cat:"GÉO",  env:"PEA", parts:0.40,    px:31.35,  pru:30.50, cible:5,  col:"#3a6f9e", manualPerf:null},
  {id:5, n:"Emerging Mkts", tk:"EIMI", cat:"GÉO",  env:"PEA", parts:3.80,    px:16.40,  pru:16.80, cible:5,  col:"#3a6f9e", manualPerf:null},
  {id:6, n:"Nasdaq 100",    tk:"CNDX", cat:"THÉM.",env:"PEA", parts:1.15,    px:74.96,  pru:72.10, cible:8,  col:"#5a5a52", manualPerf:null},
  {id:7, n:"Défense Europe",tk:"ADEF", cat:"THÉM.",env:"PEA", parts:2.30,    px:15.43,  pru:14.90, cible:7,  col:"#5a5a52", manualPerf:null},
  {id:8, n:"Private Equity",tk:"—",    cat:"ALT.", env:"CTO", parts:1.00,    px:20.00,  pru:20.00, cible:10, col:"#b4b2a9", manualPerf:8.0},
  {id:9, n:"Bitcoin",       tk:"BTC",  cat:"ALT.", env:"CTO", parts:0.000105,px:95238,  pru:95238, cible:8,  col:"#e8a022", manualPerf:null},
  {id:10,n:"Solana",        tk:"SOL",  cat:"ALT.", env:"CTO", parts:0.0610,  px:163.93, pru:163.93,cible:2,  col:"#7c6f9e", manualPerf:null},
];

function loadAssets(){const s=localStorage.getItem('pf_assets');if(s){try{return JSON.parse(s);}catch(e){}}return JSON.parse(JSON.stringify(DEFAULT_ASSETS));}
function saveAssets(){localStorage.setItem('pf_assets',JSON.stringify(A));}
let A=loadAssets();

const val  = a => a.parts * a.px;
const cost = a => a.pru > 0 ? a.parts * a.pru : val(a);
const pnl  = a => val(a) - cost(a);
const tot  = () => A.reduce((s,a) => s + val(a), 0);

function fmtParts(a){if(a.tk==='BTC')return a.parts.toFixed(6);if(a.tk==='SOL')return a.parts.toFixed(4);return a.parts.toFixed(2);}
function fmtPx(a){if(a.px>=1000)return '€'+Math.round(a.px).toLocaleString('fr-FR');return '€'+a.px.toFixed(2);}
function fmtEur(n){const abs=Math.abs(n);const s=abs>=1000?Math.round(abs).toLocaleString('fr-FR'):abs.toFixed(2);return(n>=0?'+':'−')+'€'+s;}
function calcUSExp(){const T=tot();if(!T)return 0;const msci=val(A.find(a=>a.tk==='IWDA')||{parts:0,px:0})*0.70;const sp=val(A.find(a=>a.tk==='SXR8')||{parts:0,px:0});const ndaq=val(A.find(a=>a.tk==='CNDX')||{parts:0,px:0})*0.65;return Math.round((msci+sp+ndaq)/T*100);}

const ETF_NEWS=[
  {src:'Bloomberg',t:'MSCI World up 1.2% this week, driven by US tech',time:'2h ago'},
  {src:'CoinDesk', t:'Bitcoin consolidates around $95k after recent rally',time:'4h ago'},
  {src:'Decrypt',  t:'Solana surpasses 400M daily transactions milestone',time:'6h ago'},
  {src:'FT',       t:'European defence ETFs attract €4bn inflows in February',time:'Yesterday'},
  {src:'Reuters',  t:'Emerging markets under pressure after US inflation data',time:'Yesterday'},
];
const MACRO_NEWS=[
  {src:'ECB',  t:'Rates held at 3.15% — next decision April 17',time:'3 days ago'},
  {src:'Fed',  t:'Powell: "No rate cuts before convincing inflation easing"',time:'4 days ago'},
  {src:'IMF',  t:'2026 global growth forecast revised up to +3.1%',time:'1 week ago'},
  {src:'OECD', t:'Eurozone inflation expected to reach target by Q3 2026',time:'1 week ago'},
];

const GEO_DATA=[
  {region:"États-Unis",pct:63,col:"#2d3f52",ids:[840]},
  {region:"Europe",    pct:17,col:"#3a6f9e",ids:[276,250,380,724,826,756,752,578,208,528,56,40,620,372,300,203,348,703,705,191]},
  {region:"Émergents", pct:11,col:"#7aa8c8",ids:[156,356,76,710,643,484,360,458,764,858,170,566,792]},
  {region:"Japon",     pct:3, col:"#b4b2a9",ids:[392]},
  {region:"Crypto",    pct:5, col:"#e8a022",ids:[]},
];
