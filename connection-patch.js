(()=>{
  const funnyNames=[
    'ねこ写真_最終最終.zip',
    '本当に安全なパッチ.iso',
    'あとで見る動画_12年目.mkv',
    '開きっぱなしタブ8473個.dat',
    '家族LINE黒歴史.tar',
    '消したはずの履歴.db',
    'クラウド全部_触るな.tar',
    '地球バックアップ_月曜前.img',
    '月のWiFiパスワード.txt',
    '太陽系キャッシュ_消すな.bin',
    '宇宙_本当の最終版.tar'
  ];
  funnyNames.forEach((name,i)=>{if(files[i])files[i][0]=name;});
  if(els.fileName){
    Object.assign(els.fileName.style,{maxWidth:'72%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'});
  }

  let bootSnapshot=null;
  try{const raw=localStorage.getItem('download-tycoon-save-v3');if(raw)bootSnapshot=JSON.parse(raw);}catch{}

  function settleClosedSession(snapshot){
    const wasClosed=!!snapshot&&(snapshot.pauseReason==='APP CLOSED'||snapshot.closedRunning===true);
    if(!wasClosed){
      state.paused=false;state.pauseReason='';state.closedRunning=false;scheduleInterruption();dirty=true;render();return;
    }
    const wasRunning=snapshot.closedRunning===true;
    const elapsed=Math.max(0,(Date.now()-(snapshot.lastSeen||Date.now()))/1000);
    const limit=((snapshot.upgrades&&snapshot.upgrades.keepalive)||0)*300;
    if(wasRunning&&limit>0&&elapsed>1){
      const active=Math.min(elapsed,limit),gain=rawSpeed()*active;
      if(gain>0){state.paused=false;addData(gain);addLog(`BACKGROUND RUN ${formatDuration(active)} :: +${formatBytes(gain)}`,'hot');showToast(`WELCOME BACK :: BACKGROUND +${formatBytes(gain)}`);}
    }
    state.closedRunning=false;state.lastSeen=Date.now();
    if(wasRunning&&limit>0&&elapsed<limit){
      state.paused=false;state.pauseReason='';scheduleInterruption();addLog(`KEEP-ALIVE ACTIVE :: ${formatDuration(limit-elapsed)} REMAINING`,'good');
    }else{
      state.paused=true;state.pauseReason=wasRunning&&limit>0?'KEEP-ALIVE EXPIRED':'APP CLOSED';nextInterruptionAt=0;
      if(wasRunning&&limit>0)addLog(`KEEP-ALIVE EXPIRED AFTER ${formatDuration(limit)} :: DOWNLOAD STOPPED`,'danger');
    }
    dirty=true;render();
  }

  settleClosedSession(bootSnapshot);

  applyClosedSession=function(){
    const wasClosed=state.pauseReason==='APP CLOSED'||state.closedRunning;
    if(!wasClosed){state.paused=false;scheduleInterruption();dirty=true;return;}
    const wasRunning=state.closedRunning;
    const elapsed=Math.max(0,(Date.now()-(state.lastSeen||Date.now()))/1000),limit=offlineWindowSec();
    if(wasRunning&&limit>0&&elapsed>1){
      const active=Math.min(elapsed,limit),gain=rawSpeed()*active;
      if(gain>0){state.paused=false;addData(gain);addLog(`BACKGROUND RUN ${formatDuration(active)} :: +${formatBytes(gain)}`,'hot');showToast(`WELCOME BACK :: BACKGROUND +${formatBytes(gain)}`);}
    }
    state.closedRunning=false;state.lastSeen=Date.now();
    if(wasRunning&&limit>0&&elapsed<limit){
      state.paused=false;state.pauseReason='';scheduleInterruption();addLog(`KEEP-ALIVE ACTIVE :: ${formatDuration(limit-elapsed)} REMAINING`,'good');
    }else{
      state.paused=true;state.pauseReason=wasRunning&&limit>0?'KEEP-ALIVE EXPIRED':'APP CLOSED';nextInterruptionAt=0;
      if(wasRunning&&limit>0)addLog(`KEEP-ALIVE EXPIRED AFTER ${formatDuration(limit)} :: DOWNLOAD STOPPED`,'danger');
    }
    dirty=true;
  };
})();
