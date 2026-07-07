window.addEventListener('load',()=>setTimeout(async ()=>{
  const fails=[];
  let ok=0;
  for(const b of UNITS[10].blocks){
    if(!b.code)continue;
    const r=await PyRun(b.code);
    if(r.ok&&r.figs.length>0)ok++;else fails.push(String(r.err||'nofig').slice(0,70));
  }
  document.title='RESULT::u11 ok='+ok+' fails='+(fails.length?fails.join('|'):'0');
},600));
