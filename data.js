if(sessionStorage.getItem('pf_auth')!=='ok') window.location.href='index.html';
function logout(){sessionStorage.removeItem('pf_auth');window.location.href='index.html';}

const DEFAULT_ASSETS=[
  {id:1,  n:"PEA Monde",       tk:"FR0014U5Q4", cat:"GÉO",  env:"PEA", parts:42,       px:5.43,   pru:5.23,   cible:25, col:"#3a6f9e", manualPerf:null, isin:"FR001400U5Q4"},
  {id:2,  n:"S&P 500",         tk:"FR0011871128",cat:"GÉO", env:"PEA", parts:1,        px:50.68,  pru:48.76,  cible:10, col:"#3a6f9e", manualPerf:null, isin:"FR0011871128"},
  {id:3,  n:"Euro Stoxx 600",  tk:"FR0011550193",cat:"GÉO", env:"PEA", parts:3,        px:19.34,  pru:18.83,  cible:10, col:"#3a6f9e", manualPerf:null, isin:"FR0011550193"},
  {id:4,  n:"CAC 40",          tk:"FR0010150458",cat:"GÉO", env:"PEA", parts:1,        px:12.49,  pru:13.11,  cible:2.5,col:"#3a6f9e", manualPerf:null, isin:"FR0010150458"},
  {id:5,  n:"Japon",           tk:"—",           cat:"GÉO", env:"PEA", parts:0,        px:0,      pru:0,      cible:2.5,col:"#3a6f9e", manualPerf:null, isin:""},
  {id:6,  n:"Emerging Markets",tk:"FR0013412020",cat:"GÉO", env:"PEA", parts:2,        px:30.86,  pru:28.04,  cible:5,  col:"#3a6f9e", manualPerf:null, isin:"FR0013412020"},
  {id:7,  n:"Nasdaq 100",      tk:"FR0011871110",cat:"THÉM.",env:"PEA",parts:1,        px:85.76,  pru:85.14,  cible:8,  col:"#5a5a52", manualPerf:null, isin:"FR0011871110"},
  {id:8,  n:"Défense Europe",  tk:"LU3047998896",cat:"THÉM.",env:"PEA",parts:3,        px:11.90,  pru:11.91,  cible:7,  col:"#5a5a52", manualPerf:null, isin:"LU3047998896"},
  {id:9,  n:"Private Equity",  tk:"EQT",         cat:"ALT.", env:"CTO",parts:1,        px:20,     pru:20,     cible:10, col:"#b4b2a9", manualPerf:null, isin:""},
  {id:10, n:"Bitcoin",         tk:"BTC",          cat:"ALT.", env:"CTO",parts:0.000561, px:78706.66,pru:78706.66,cible:8,col:"#e8a022", manualPerf:null, isin:""},
  {id:11, n:"Solana",          tk:"SOL",          cat:"ALT.", env:"CTO",parts:0.079536, px:126.07, pru:126.07, cible:2,  col:"#7c6f9e", manualPerf:null, isin:""},
];

function loadAssets(){const s=localStorage.getItem('pf_assets');if(s){try{return JSON.parse(s);}catch(e){}}return JSON.parse(JSON.stringify(DEFAULT_ASSETS));}
function saveAssets(){localStorage.setItem('pf_assets',JSON.stringify(A));}
let A=loadAssets();

const val  = a => a.parts * a.px;
const cost = a => a.pru > 0 ? a.parts * a.pru : val(a);
const pnl  = a => val(a) - cost(a);
const tot  = () => A.reduce((s,a) => s + val(a), 0);

function fmtParts(a){if(a.tk==='BTC')return a.parts.toFixed(6);if(a.tk==='SOL')return a.parts.toFixed(6);return a.parts.toFixed(2);}
function fmtPx(a){if(a.px>=1000)return '€'+Math.round(a.px).toLocaleString('fr-FR');return '€'+a.px.toFixed(2);}
function fmtEur(n){const abs=Math.abs(n);const s=abs>=1000?Math.round(abs).toLocaleString('fr-FR'):abs.toFixed(2);return(n>=0?'+':'−')+'€'+s;}
function calcUSExp(){const T=tot();if(!T)return 0;const monde=val(A.find(a=>a.id===1)||{parts:0,px:0})*0.65;const sp=val(A.find(a=>a.id===2)||{parts:0,px:0});const ndaq=val(A.find(a=>a.id===7)||{parts:0,px:0})*0.65;return Math.round((monde+sp+ndaq)/T*100);}

const ETF_NEWS=[
  {src:'Bloomberg',t:'MSCI World up 1.2% this week, driven by US tech',time:'2h ago'},
  {src:'CoinDesk', t:'Bitcoin consolidates after recent volatility',time:'4h ago'},
  {src:'Decrypt',  t:'Solana network activity hits new highs',time:'6h ago'},
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
  {region:"États-Unis",pct:58,col:"#2d3f52",ids:[840]},
  {region:"Europe",    pct:22,col:"#3a6f9e",ids:[276,250,380,724,826,756,752,578,208,528,56,40,620,372,300,203,348,703,705,191]},
  {region:"Émergents", pct:10,col:"#7aa8c8",ids:[156,356,76,710,643,484,360,458,764,858,170,566,792]},
  {region:"Japon",     pct:5, col:"#b4b2a9",ids:[392]},
  {region:"Crypto",    pct:5, col:"#e8a022",ids:[]},
];
