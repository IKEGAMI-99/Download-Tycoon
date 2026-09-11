const STORAGE_KEY = 'download-tycoon-save-v1';

const files = [
  ['cat_photo.zip', 12 * 1024 ** 2],
  ['game_patch.iso', 680 * 1024 ** 2],
  ['movie_archive.mkv', 18 * 1024 ** 3],
  ['internet_archive.dat', 4.8 * 1024 ** 5],
  ['GLOBAL_NETWORK_BACKUP', 82 * 1024 ** 6],
  ['EARTH_DATASET', 4.2 * 1024 ** 7],
  ['UNIVERSE_BACKUP.tar', 9.9 * 1024 ** 8]
];

const upgrades = [
  {id:'modem', name:'MODEM BOOST', desc:'クリック転送量 +64 KB', base:2*1024**2, scale:1.7, click:64*1024},
  {id:'daemon', name:'DOWNLOAD DAEMON', desc:'自動転送 +128 KB/s', base:8*1024**2, scale:1.72, dps:128*1024},
  {id:'fiber', name:'FIBER LINE', desc:'自動転送 +2 MB/s', base:180*1024**2, scale:1.78, dps:2*1024**2},
  {id:'rack', name:'SERVER RACK', desc:'自動転送 +64 MB/s', base:8*1024**3, scale:1.82, dps:64*1024**2},
  {id:'dc', name:'DATA CENTER', desc:'全転送速度 x1.5', base:280*1024**3, scale:2.15, mult:1.5},
  {id:'backbone', name:'GLOBAL BACKBONE', desc:'自動転送 +8 GB/s', base:32*1024**4, scale:2.0, dps:8*1024**3}
];

const defaultState = () => ({
  data:0, total:0, progress:0, fileIndex:0, clickPower:64*1024,
  baseDps:0, multiplier:1, packets:0, upgrades:{}, lastSeen:Date.now()
});

let state = load();
let dirty = true;
let lastFrame = performance.now();

const $ = id => document.getElementById(id);
const els = {
  fileName:$('fileName'), fileSize:$('fileSize'), progressText:$('progressText'), progressAmount:$('progressAmount'),
  progressBar:$('progressBar'), speed:$('speed'), clickPower:$('clickPower'), totalData:$('totalData'), packets:$('packets'),
  upgradeList:$('upgradeList'), logs:$('logs'), asciiMap:$('asciiMap'), downloadBtn:$('downloadBtn'), terminal:$('terminal'),
  floatLayer:$('floatLayer'), saveState:$('saveState'), resetBtn:$('resetBtn')
};

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    return {...defaultState(), ...JSON.parse(raw)};
  }catch{return defaultState();}
}

function save(){
  state.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  els.saveState.textContent = `SAVED ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
}

function formatBytes(n, perSec=false){
  if(!Number.isFinite(n)) return '∞';
  const units=['B','KB','MB','GB','TB','PB','EB','ZB','YB'];
  let i=0, v=Math.max(0,n);
  while(v>=1024 && i<units.length-1){v/=1024;i++;}
  const digits=v>=100?0:v>=10?1:2;
  return `${v.toFixed(digits)} ${units[i]}${perSec?'/s':''}`;
}

function currentFile(){ return files[Math.min(state.fileIndex, files.length-1)]; }
function speed(){ return state.baseDps * state.multiplier; }
function clickAmount(){ return state.clickPower * state.multiplier; }

function addData(amount, fromClick=false, x=innerWidth/2, y=innerHeight/2){
  if(amount<=0) return;
  state.data += amount;
  state.total += amount;
  state.progress += amount;
  if(fromClick){
    state.packets++;
    spawnFloat(`+${formatBytes(amount)}`,x,y);
    els.terminal.classList.remove('flash'); void els.terminal.offsetWidth; els.terminal.classList.add('flash');
  }
  completeFiles();
  dirty=true;
}

function completeFiles(){
  let guard=0;
  while(guard++<50){
    const [,size]=currentFile();
    if(state.progress<size) break;
    state.progress-=size;
    addLog(`DOWNLOAD COMPLETE :: ${currentFile()[0]}`,'hot');
    if(state.fileIndex<files.length-1) state.fileIndex++;
    else state.progress%=size;
  }
}

function spawnFloat(text,x,y){
  const n=document.createElement('div'); n.className='float'; n.textContent=text;
  n.style.left=`${x}px`; n.style.top=`${y}px`; els.floatLayer.appendChild(n);
  setTimeout(()=>n.remove(),700);
}

function addLog(text,type=''){
  const line=document.createElement('div'); line.className=`log ${type}`; line.textContent=`> ${text}`;
  els.logs.appendChild(line);
  while(els.logs.children.length>18) els.logs.firstChild.remove();
}

function costOf(u){ const count=state.upgrades[u.id]||0; return u.base*Math.pow(u.scale,count); }

function buy(u){
  const cost=costOf(u); if(state.data<cost) return;
  state.data-=cost; state.upgrades[u.id]=(state.upgrades[u.id]||0)+1;
  if(u.click) state.clickPower+=u.click;
  if(u.dps) state.baseDps+=u.dps;
  if(u.mult) state.multiplier*=u.mult;
  addLog(`${u.name} INSTALLED [${state.upgrades[u.id]}]`,'good');
  dirty=true; renderUpgrades(); renderMap();
}

function renderUpgrades(){
  els.upgradeList.innerHTML='';
  upgrades.forEach(u=>{
    const cost=costOf(u), count=state.upgrades[u.id]||0;
    const b=document.createElement('button'); b.className='upgrade'; b.disabled=state.data<cost;
    b.innerHTML=`<span class="upgrade-name">[ ${u.name} ] x${count}</span><span class="upgrade-desc">${u.desc}</span><span class="upgrade-cost">${formatBytes(cost)}</span>`;
    b.onclick=()=>buy(u); els.upgradeList.appendChild(b);
  });
}

function renderMap(){
  const racks=state.upgrades.rack||0, dcs=state.upgrades.dc||0, backbone=state.upgrades.backbone||0;
  if(backbone>0) els.asciiMap.textContent='[TOKYO]====[IX]====[NEW YORK]====[LONDON]\n   ||        ||          ||          ||\n [DC]====== GLOBAL BACKBONE =======[DC]';
  else if(dcs>0) els.asciiMap.textContent='     _______________________\n    | DATA CENTER  ONLINE   |\n    | [RACK][RACK][RACK]    |\n    |_______________________|\n              ||\n           INTERNET';
  else if(racks>0) els.asciiMap.textContent='      ___________\n     | SERVER 01 |\n     | SERVER 02 |\n     | SERVER 03 |\n     |___________|\n          ||\n       INTERNET';
  else els.asciiMap.textContent='        [ LOCAL PC ]\n             |\n         [ MODEM ]\n             |\n          INTERNET';
}

function render(){
  const [name,size]=currentFile(), pct=Math.min(100,state.progress/size*100);
  els.fileName.textContent=name; els.fileSize.textContent=formatBytes(size); els.progressText.textContent=`${pct.toFixed(2)}%`;
  els.progressAmount.textContent=`${formatBytes(state.progress)} / ${formatBytes(size)}`;
  const slots=40, fill=Math.round(pct/100*slots); els.progressBar.textContent=`[${'#'.repeat(fill)}${'.'.repeat(slots-fill)}]`;
  els.speed.textContent=formatBytes(speed(),true); els.clickPower.textContent=formatBytes(clickAmount()); els.totalData.textContent=formatBytes(state.total); els.packets.textContent=state.packets.toLocaleString();
  renderUpgrades(); dirty=false;
}

function offlineGain(){
  const elapsed=Math.min(8*3600, Math.max(0,(Date.now()-(state.lastSeen||Date.now()))/1000));
  const gain=speed()*elapsed;
  if(gain>0 && elapsed>5){ addData(gain); addLog(`OFFLINE ${Math.floor(elapsed)}s :: +${formatBytes(gain)}`,'hot'); }
}

els.downloadBtn.addEventListener('pointerdown',e=>{
  const crit=Math.random()<.05, amount=clickAmount()*(crit?8:1);
  addData(amount,true,e.clientX,e.clientY);
  if(crit) addLog(`CRITICAL PACKET +${formatBytes(amount)}`,'hot');
});

els.resetBtn.onclick=()=>{
  if(confirm('セーブデータを完全に消去しますか？')){ localStorage.removeItem(STORAGE_KEY); state=defaultState(); renderMap(); render(); addLog('SAVE DATA RESET'); }
};

document.addEventListener('visibilitychange',()=>{ if(document.hidden) save(); else { state.lastSeen=Date.now(); } });
window.addEventListener('beforeunload',save);

function loop(now){
  const dt=Math.min(.25,(now-lastFrame)/1000); lastFrame=now;
  addData(speed()*dt);
  if(dirty) render();
  requestAnimationFrame(loop);
}

offlineGain();
renderMap();
addLog('CONNECTION ESTABLISHED','good');
addLog('READY TO DOWNLOAD');
render();
setInterval(save,10000);
requestAnimationFrame(loop);

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
