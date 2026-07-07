window.addEventListener('load',()=>setTimeout(async ()=>{
  let ok=0;const fail=[];
  for(const cat of Object.keys(PGLIB)){
    for(const sn of PGLIB[cat]){
      const r=await PyRun(sn.c);
      const needFig=/plt\./.test(sn.c);
      if(r.ok&&(!needFig||r.figs.length>0))ok++;
      else fail.push(cat+'/'+sn.t+': '+String(r.err||'nofig').slice(0,60));
    }
    document.title='PROG::'+cat+' done, ok='+ok;
  }
  document.title='RESULT::ok='+ok+'/88 fail='+(fail.length?fail.join(' § '):'0');
},400));
