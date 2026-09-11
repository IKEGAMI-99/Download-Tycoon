const STORAGE_KEY='download-tycoon-save-v2';
const OLD_STORAGE_KEY='download-tycoon-save-v1';
const MB=1024**2, GB=1024**3, TB=1024**4, PB=1024**5, EB=1024**6, ZB=1024**7, YB=1024**8;

const files=[
  ['cat_photo.zip',12*MB],['game_patch.iso',680*MB],['movie_archive.mkv',18*GB],['linux_mirror.img',2.4*TB],
  ['cloud_snapshot.tar',64*TB],['internet_archive.dat',4.8*PB],['GLOBAL_NETWORK_BACKUP',82*EB],
  ['EARTH_DATASET',4.2*ZB],['LUNAR_ARCHIVE',96*ZB],['SOLAR_SYSTEM_CACHE',1.8*YB],['UNIVERSE_BACKUP.tar',999*YB]
];

const upgrades=[
  {id:'modem',name:'MODEM BOOST',desc:'クリック +64 KB',base:2*MB,scale:1.68,click:64*1024,unlock:0},
  {id:'daemon',name:'DOWNLOAD DAEMON',desc:'自動転送 +128 KB/s',base:8*MB,scale:1.70,dps:128*1024,unlock:1*MB},
  {id:'ssd',name:'SSD CACHE',desc:'クリック +512 KB',base:64*MB,scale:1.72,click:512*1024,unlock:16*MB},
  {id:'fiber',name:'FIBER LINE',desc:'自動転送 +2 MB/s',base:180*MB,scale:1.76,dps:2*MB,unlock:64*MB},
  {id:'router',name:'10G ROUTER',desc:'クリック +8 MB',base:2*GB,scale:1.78,click:8*MB,unlock:512*MB},
  {id:'rack',name:'SERVER RACK',desc:'自動転送 +64 MB/s',base:8*GB,scale:1.80,dps:64*MB,unlock:2*GB},
  {id:'cdn',name:'CDN NODE',desc:'自動転送 +1 GB/s',base:120*GB,scale:1.82,dps:1*GB,unlock:32*GB},
  {id:'dc',name:'DATA CENTER',desc:'全転送速度 x1.5',base:280*GB,scale:2.08,mult:1.5,unlock:100*GB},
  {id:'ix',name:'IX CONNECTION',desc:'自動転送 +64 GB/s',base:8*TB,scale:1.90,dps:64*GB,unlock:2*TB},
  {id:'submarine',name:'SUBMARINE CABLE',desc:'全転送速度 x2',base:400*TB,scale:2.12,mult:2,unlock:100*TB},
  {id:'backbone',name:'GLOBAL BACKBONE',desc:'自動転送 +8 TB/s',base:32*PB,scale:1.95,dps:8*TB,unlock:4*PB},
  {id:'satellite',name:'ORBITAL RELAY',desc:'自動転送 +2 PB/s',base:8*EB,scale:2.0,dps:2*PB,unlock:1*EB},
  {id:'quantum',name:'QUANTUM ROUTER',desc:'全転送速度 x4',base:512*EB,scale:2.2,mult:4,unlock:64*EB},
  {id:'stellar',name:'STELLAR NODE',desc:'自動転送 +1 EB/s',base:64*ZB,scale:2.0,dps:1*EB,unlock:8*ZB}
];

const ranks=[
  [0,'LOCAL USER'],[1*GB,'HOME NETWORK'],[100*GB,'SYSADMIN'],[10*TB,'SERVER OPERATOR'],
  [1*PB,'DATA CENTER LORD'],[1*EB,'BACKBONE CARRIER'],[1*ZB,'PLANETARY NETWORK'],[1*YB,'STELLAR INTERNET']
];

const contracts=[
  {name:'BOOTSTRAP',type:'packets',goal:100,reward:8*MB,text:'100 packets送信',rewardText:'+8 MB'},
  {name:'FIRST GIG',type:'runTotal',goal:1*GB,reward:128*MB,text:'1 GBダウンロード',rewardText:'+128 MB'},
  {name:'AUTOMATE IT',type:'speed',goal:10*MB,reward:2*GB,text:'10 MB/s到達',rewardText:'+2 GB'},
  {name:'FILE HOARDER',type:'filesDone',goal:5,reward:20*GB,text:'5ファイル完了',rewardText:'+20 GB'},
  {name:'TERABYTE CLUB',type:'runTotal',goal:1*TB,reward:200*GB,text:'1 TBダウンロード',rewardText:'+200 GB'},
  {name:'CARRIER GRADE',type:'speed',goal:1*GB,reward:2*TB,text:'1 GB/s到達',rewardText:'+2 TB'},
  {name:'PETABYTE FEVER',type:'runTotal',goal:1*PB,reward:100*TB,text:'1 PBダウンロード',rewardText:'+100 TB'},
  {name:'PLANET SCALE',type:'runTotal',goal:1*EB,reward:100*PB,text:'1 EBダウンロード',rewardText:'+100 PB'}
];

const achievementDefs=[
  ['first','FIRST PACKET',s=>s.packets>=1],['click1000','PACKET STORM',s=>s.packets>=1000],['gig','GIGABYTE',s=>s.lifetimeTotal>=GB],
  ['tera','TERABYTE',s=>s.lifetimeTotal>=TB],['speed','GIGABIT? TRY GIGABYTE',()=>speed()>=GB],['files','ARCHIVIST',s=>s.filesDone>=5],
  ['combo','COMBO x5',()=>comboMultiplier()>=5],['burst','BURST HUNTER',s=>s.bursts>=1],['reboot','REBOOTED',s=>s.knowledge>=1],
  ['global','GLOBALIZED',s=>(s.upgrades.backbone||0)>=1],['orbit','ORBITAL',s=>(s.upgrades.satellite||0)>=1],['quantum','QUANTUM NET',s=>(s.upgrades.quantum||0)>=1]
];

const defaultState=()=>({data:0,runTotal:0,lifetimeTotal:0,progress:0,fileIndex:0,clickPower:64*1024,baseDps:0,multiplier:1,packets:0,filesDone:0,upgrades:{},knowledge:0,achievements:{},contractIndex:0,bursts:0,lastSeen:Date.now()});
let state=load(),dirty=true,lastFrame=performance.now(),comboMeter=0,lastClickAt=0,burstUntil=0,eventExpires=0,nextEventAt=Date.now()+randomMs(20000,35000),deferredPrompt=null,toastTimer=null;

const $=id=>document.getElementById(id);
const els={fileName:$('fileName'),fileSize:$('fileSize'),progressText:$('progressText'),progressAmount:$('progressAmount'),progressBar:$('progressBar'),bankData:$('bankData'),speed:$('speed'),clickPower:$('clickPower'),totalData:$('totalData'),packets:$('packets'),filesDone:$('filesDone'),combo:$('combo'),knowledge:$('knowledge'),comboBar:$('comboBar'),upgradeList:$('upgradeList'),logs:$('logs'),asciiMap:$('asciiMap'),downloadBtn:$('downloadBtn'),terminal:$('terminal'),floatLayer:$('floatLayer'),saveState:$('saveState'),resetBtn:$('resetBtn'),networkRank:$('networkRank'),nextRank:$('nextRank'),eventZone:$('eventZone'),eventBtn:$('eventBtn'),contract:$('contract'),achievements:$('achievements'),achievementCount:$('achievementCount'),rebootInfo:$('rebootInfo'),rebootBtn:$('rebootBtn'),installBtn:$('installBtn'),installBtnFooter:$('installBtnFooter'),toast:$('toast')};

function load(){
  try{
    let raw=localStorage.getItem(STORAGE_KEY),old=false;
    if(!raw){raw=localStorage.getItem(OLD_STORAGE_KEY);old=!!raw;}
    if(!raw)return defaultState();
    const parsed=JSON.parse(raw),base=defaultState();
    if(old){base.data=parsed.data||0;base.runTotal=parsed.total||0;base.lifetimeTotal=parsed.total||0;base.progress=parsed.progress||0;base.fileIndex=parsed.fileIndex||0;base.clickPower=parsed.clickPower||base.clickPower;base.baseDps=parsed.baseDps||0;base.multiplier=parsed.multiplier||1;base.packets=parsed.packets||0;base.upgrades=parsed.upgrades||{};base.lastSeen=parsed.lastSeen||Date.now();return base;}
    return {...base,...parsed,upgrades:{...base.upgrades,...(parsed.upgrades||{})},achievements:{...base.achievements,...(parsed.achievements||{})}};
  }catch{return defaultState();}
}
function save(){state.lastSeen=Date.now();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));els.saveState.textContent=`SAVED ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;}
function randomMs(a,b){return Math.floor(a+Math.random()*(b-a));}
function formatBytes(n,perSec=false){if(!Number.isFinite(n))return '∞';const units=['B','KB','MB','GB','TB','PB','EB','ZB','YB'];let i=0,v=Math.max(0,n);while(v>=1024&&i<units.length-1){v/=1024;i++;}const digits=v>=100?0:v>=10?1:2;return `${v.toFixed(digits)} ${units[i]}${perSec?'/s':''}`;}
function currentFile(){return files[Math.min(state.fileIndex,files.length-1)];}
function knowledgeMult(){return Math.pow(1.25,state.knowledge);}
function burstMult(){return Date.now()<burstUntil?10:1;}
function speed(){return state.baseDps*state.multiplier*knowledgeMult()*burstMult();}
function comboMultiplier(){return 1+Math.min(40,comboMeter)*0.1;}
function clickAmount(){return state.clickPower*state.multiplier*knowledgeMult()*burstMult()*comboMultiplier();}

function addData(amount,fromClick=false,x=innerWidth/2,y=innerHeight/2){
  if(amount<=0)return;state.data+=amount;state.runTotal+=amount;state.lifetimeTotal+=amount;state.progress+=amount;
  if(fromClick){state.packets++;spawnFloat(`+${formatBytes(amount)}`,x,y);els.terminal.classList.remove('flash');void els.terminal.offsetWidth;els.terminal.classList.add('flash');}
  completeFiles();checkContract();checkAchievements();dirty=true;
}
function completeFiles(){let guard=0;while(guard++<100){const [,size]=currentFile();if(state.progress<size)break;state.progress-=size;state.filesDone++;const completed=currentFile()[0];const bonus=size*.02;state.data+=bonus;addLog(`DOWNLOAD COMPLETE :: ${completed} :: CHECKSUM BONUS +${formatBytes(bonus)}`,'hot');if(state.fileIndex<files.length-1)state.fileIndex++;else state.progress%=size;}}
function spawnFloat(text,x,y){const n=document.createElement('div');n.className='float';n.textContent=text;n.style.left=`${x}px`;n.style.top=`${y}px`;els.floatLayer.appendChild(n);setTimeout(()=>n.remove(),700);}
function addLog(text,type=''){const line=document.createElement('div');line.className=`log ${type}`;line.textContent=`> ${text}`;els.logs.appendChild(line);while(els.logs.children.length>16)els.logs.firstChild.remove();}
function showToast(text,ms=3200){clearTimeout(toastTimer);els.toast.textContent=text;els.toast.hidden=false;toastTimer=setTimeout(()=>els.toast.hidden=true,ms);}
function costOf(u){return u.base*Math.pow(u.scale,state.upgrades[u.id]||0);}
function unlocked(u){return state.runTotal>=u.unlock||(state.upgrades[u.id]||0)>0;}
function buy(u){const cost=costOf(u);if(state.data<cost||!unlocked(u))return;state.data-=cost;state.upgrades[u.id]=(state.upgrades[u.id]||0)+1;if(u.click)state.clickPower+=u.click;if(u.dps)state.baseDps+=u.dps;if(u.mult)state.multiplier*=u.mult;addLog(`${u.name} INSTALLED [${state.upgrades[u.id]}]`,'good');dirty=true;renderMap();checkAchievements();}
function renderUpgrades(){els.upgradeList.innerHTML='';upgrades.forEach(u=>{const isUnlocked=unlocked(u),cost=costOf(u),count=state.upgrades[u.id]||0,b=document.createElement('button');b.className=`upgrade${isUnlocked?'':' locked'}`;b.disabled=!isUnlocked||state.data<cost;b.innerHTML=isUnlocked?`<span class="upgrade-name">[ ${u.name} ] x${count}</span><span class="upgrade-desc">${u.desc}</span><span class="upgrade-cost">${formatBytes(cost)}</span>`:`<span class="upgrade-name">[ ???????? ]</span><span class="upgrade-desc">UNLOCK @ ${formatBytes(u.unlock)} RUN DATA</span><span class="upgrade-cost">LOCKED</span>`;b.onclick=()=>buy(u);els.upgradeList.appendChild(b);});}

function mapStage(){if((state.upgrades.stellar||0)>0)return 7;if((state.upgrades.satellite||0)>0)return 6;if((state.upgrades.backbone||0)>0)return 5;if((state.upgrades.submarine||0)>0)return 4;if((state.upgrades.dc||0)>0)return 3;if((state.upgrades.rack||0)>0)return 2;if((state.upgrades.fiber||0)>0)return 1;return 0;}
function renderMap(){const maps=[
'        [ LOCAL PC ]\n             |\n         [ MODEM ]\n             |\n          INTERNET',
'        [ LOCAL PC ]\n             ||\n       === FIBER ===\n             ||\n          INTERNET',
'      +-----------+\n      | SERVER 01 |\n      | SERVER 02 |\n      | SERVER 03 |\n      +-----------+\n           ||\n        INTERNET',
'     _______________________\n    | DATA CENTER  ONLINE   |\n    | [RACK][RACK][RACK]    |\n    | [RACK][RACK][RACK]    |\n    |_______________________|\n              ||\n             [IX]',
'[TOKYO]====[IX]====[NEW YORK]====[LONDON]\n   ||        ||          ||          ||\n  [DC]======+====OCEAN====+=========[DC]\n             SUBMARINE CABLE',
' [TOKYO]===+===[GLOBAL BACKBONE]===+===[NYC]\n    ||      |         ||            |     ||\n   [DC]   [IX]=======[IX]         [DC]   [DC]\n    ||      |         ||            |     ||\n ======== WORLD NETWORK :: ONLINE ========',
'             .       *       .\n        [SAT-1]---[SAT-2]---[SAT-3]\n           \\       |       //\n        +---\\---[ EARTH ]---//---+\n        |        GLOBAL NET       |\n        +=========================+',
'       *             .             *\n   [LUNA]====[EARTH]====[MARS]====[JOVE]\n      \\         ||         //\n       \\==== QUANTUM NET ====//\n              ||\n         [STELLAR NODE]\n              ||\n          ...UNKNOWN...'];els.asciiMap.textContent=maps[mapStage()];}

function rankInfo(){let idx=0;for(let i=0;i<ranks.length;i++)if(state.runTotal>=ranks[i][0])idx=i;return {idx,name:ranks[idx][1],next:ranks[idx+1]};}
function contractValue(c){if(!c)return 0;if(c.type==='speed')return speed();return state[c.type]||0;}
function checkContract(){const c=contracts[state.contractIndex];if(!c)return;if(contractValue(c)>=c.goal){state.data+=c.reward;addLog(`CONTRACT COMPLETE :: ${c.name} :: ${c.rewardText}`,'hot');showToast(`CONTRACT COMPLETE: ${c.name} / REWARD ${c.rewardText}`);state.contractIndex++;dirty=true;}}
function renderContract(){const c=contracts[state.contractIndex];if(!c){els.contract.innerHTML='<b>ALL CONTRACTS COMPLETE</b><br><span class="contract-progress">The network has stopped pretending this was work.</span>';return;}const value=Math.min(contractValue(c),c.goal),pct=Math.min(100,value/c.goal*100);els.contract.innerHTML=`<b>${c.name}</b><br>${c.text}<br><span class="contract-progress">${formatContractValue(c,value)} / ${formatContractValue(c,c.goal)} [${pct.toFixed(0)}%]<br>REWARD :: ${c.rewardText}</span>`;}
function formatContractValue(c,v){return c.type==='packets'||c.type==='filesDone'?Math.floor(v).toLocaleString():formatBytes(v,c.type==='speed');}
function checkAchievements(){achievementDefs.forEach(([id,name,test])=>{if(!state.achievements[id]&&test(state)){state.achievements[id]=true;addLog(`ACHIEVEMENT UNLOCKED :: ${name}`,'good');}});}
function renderAchievements(){els.achievements.innerHTML='';let done=0;achievementDefs.forEach(([id,name])=>{const d=document.createElement('div');const yes=!!state.achievements[id];if(yes)done++;d.className=`achievement${yes?' done':''}`;d.textContent=name;els.achievements.appendChild(d);});els.achievementCount.textContent=`${done}/${achievementDefs.length}`;}
function prestigePoints(){return Math.floor(Math.sqrt(state.runTotal/PB));}
function renderReboot(){const pts=prestigePoints();els.rebootBtn.disabled=pts<1;els.rebootInfo.textContent=pts<1?`Reach 1 PB this run to unlock. (${formatBytes(state.runTotal)} / 1.00 PB)`:`Reboot now: +${pts} KNOWLEDGE. Each point gives permanent x1.25 throughput.`;}
function reboot(){const pts=prestigePoints();if(pts<1)return;if(!confirm(`ネットワーク設備とRUN DATAを初期化して KNOWLEDGE +${pts} を獲得しますか？`))return;const keep={knowledge:state.knowledge+pts,lifetimeTotal:state.lifetimeTotal,achievements:state.achievements,contractIndex:state.contractIndex,bursts:state.bursts};state={...defaultState(),...keep};comboMeter=0;burstUntil=0;addLog(`NETWORK REBOOTED :: KNOWLEDGE +${pts}`,'hot');showToast(`REBOOT COMPLETE :: PERMANENT MULTIPLIER x${knowledgeMult().toFixed(2)}`);renderMap();dirty=true;save();}

function triggerEvent(){if(eventExpires||Date.now()<burstUntil)return;eventExpires=Date.now()+10000;els.eventZone.hidden=false;addLog('BANDWIDTH ANOMALY DETECTED :: 10s WINDOW','hot');}
function captureBurst(){if(!eventExpires||Date.now()>eventExpires)return;eventExpires=0;els.eventZone.hidden=true;burstUntil=Date.now()+10000;state.bursts++;nextEventAt=Date.now()+randomMs(45000,85000);addLog('BURST CAPTURED :: ALL THROUGHPUT x10 FOR 10s','hot');showToast('BANDWIDTH BURST :: x10 FOR 10 SECONDS');checkAchievements();dirty=true;}
function updateEvents(){const now=Date.now();if(eventExpires&&now>eventExpires){eventExpires=0;els.eventZone.hidden=true;nextEventAt=now+randomMs(30000,60000);addLog('BANDWIDTH ANOMALY LOST');}if(!eventExpires&&now>=nextEventAt&&now>=burstUntil)triggerEvent();}

function render(){const [name,size]=currentFile(),pct=Math.min(100,state.progress/size*100),rank=rankInfo();els.fileName.textContent=name;els.fileSize.textContent=formatBytes(size);els.progressText.textContent=`${pct.toFixed(2)}%`;els.progressAmount.textContent=`${formatBytes(state.progress)} / ${formatBytes(size)}`;const slots=40,fill=Math.round(pct/100*slots);els.progressBar.textContent=`[${'#'.repeat(fill)}${'.'.repeat(slots-fill)}]`;els.bankData.textContent=formatBytes(state.data);els.speed.textContent=formatBytes(speed(),true);els.clickPower.textContent=formatBytes(clickAmount());els.totalData.textContent=formatBytes(state.runTotal);els.packets.textContent=state.packets.toLocaleString();els.filesDone.textContent=state.filesDone.toLocaleString();els.combo.textContent=`x${comboMultiplier().toFixed(2)}`;els.knowledge.textContent=state.knowledge.toLocaleString();els.networkRank.textContent=`RANK ${rank.idx} :: ${rank.name}`;els.nextRank.textContent=rank.next?`NEXT: ${formatBytes(rank.next[0])}`:'MAX RANK';const bars=Math.round(comboMeter/4);els.comboBar.textContent=`COMBO [${'#'.repeat(bars)}${'.'.repeat(10-bars)}] x${comboMultiplier().toFixed(2)}${Date.now()<burstUntil?' :: BURST x10':''}`;renderUpgrades();renderContract();renderAchievements();renderReboot();dirty=false;}

function applyOfflineGain(){const elapsed=Math.min(8*3600,Math.max(0,(Date.now()-(state.lastSeen||Date.now()))/1000)),gain=state.baseDps*state.multiplier*knowledgeMult()*elapsed;if(gain>0&&elapsed>5){addData(gain);addLog(`OFFLINE ${Math.floor(elapsed)}s :: +${formatBytes(gain)}`,'hot');showToast(`WELCOME BACK :: OFFLINE +${formatBytes(gain)}`);}state.lastSeen=Date.now();}

els.downloadBtn.addEventListener('pointerdown',e=>{const now=performance.now();comboMeter=now-lastClickAt<650?Math.min(40,comboMeter+1.35):Math.max(0,comboMeter-2);lastClickAt=now;const crit=Math.random()<.05,amount=clickAmount()*(crit?8:1);addData(amount,true,e.clientX,e.clientY);if(crit)addLog(`CRITICAL PACKET x8 :: +${formatBytes(amount)}`,'hot');});
els.eventBtn.onclick=captureBurst;els.rebootBtn.onclick=reboot;
els.resetBtn.onclick=()=>{if(confirm('セーブデータを完全に消去しますか？')){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(OLD_STORAGE_KEY);state=defaultState();comboMeter=0;burstUntil=0;renderMap();render();addLog('SAVE DATA RESET');}};

document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{applyOfflineGain();lastFrame=performance.now();dirty=true;}});window.addEventListener('beforeunload',save);
function loop(now){const dt=Math.min(.25,(now-lastFrame)/1000);lastFrame=now;if(now-lastClickAt>500)comboMeter=Math.max(0,comboMeter-dt*5);addData(speed()*dt);updateEvents();if(dirty||comboMeter>0||Date.now()<burstUntil)render();requestAnimationFrame(loop);}

function isStandalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}
function updateInstallButtons(){const installed=isStandalone();els.installBtn.hidden=installed;els.installBtnFooter.hidden=installed;}
async function installPwa(){if(isStandalone()){showToast('DOWNLOAD TYCOON IS ALREADY INSTALLED');return;}if(deferredPrompt){deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;if(choice.outcome==='accepted')showToast('INSTALL REQUEST ACCEPTED');deferredPrompt=null;updateInstallButtons();return;}const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);showToast(isiOS?'iPhone/iPad: 共有 →「ホーム画面に追加」でインストールできます。':'ブラウザメニューの「アプリをインストール」または「ホーム画面に追加」を選んでください。',5200);}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;updateInstallButtons();});window.addEventListener('appinstalled',()=>{deferredPrompt=null;updateInstallButtons();showToast('DOWNLOAD TYCOON INSTALLED');});els.installBtn.onclick=installPwa;els.installBtnFooter.onclick=installPwa;

applyOfflineGain();renderMap();checkAchievements();addLog('CONNECTION ESTABLISHED','good');addLog('DOWNLOAD TYCOON v0.2 READY');render();updateInstallButtons();setInterval(save,10000);requestAnimationFrame(loop);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
