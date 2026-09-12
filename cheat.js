(()=>{
  const form=document.getElementById('accessForm');
  const input=document.getElementById('accessCode');
  const message=document.getElementById('accessMessage');
  if(!form||!input||!message)return;

  form.addEventListener('submit',event=>{
    event.preventDefault();
    const code=input.value.trim();
    input.value='';

    if(code==='ikegami'){
      state.data=999*YB;
      dirty=true;
      render();
      save();
      message.textContent='ACCESS GRANTED :: BANK MAXED';
      message.className='access-message ok';
      addLog('ADMIN ACCESS :: AVAILABLE BANK SET TO 999 YB','hot');
      showToast('ACCESS GRANTED :: BANK 999 YB',3600);
      return;
    }

    message.textContent='ACCESS DENIED';
    message.className='access-message bad';
    showToast('ACCESS DENIED',1800);
  });
})();
