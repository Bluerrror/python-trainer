window.addEventListener('load',()=>setTimeout(async ()=>{
  let ok=0;const fail=[];
  for(const sn of PGLIB['Plotly']){
    const r=await PyRun(sn.c);
    if(r.ok&&r.plotly&&r.plotly.length>0)ok++;else fail.push(sn.t+':'+String(r.err||'nofig').slice(0,50));
  }
  for(const e of EXAMPLES.filter(x=>x.cat==='Plotly')){
    const r=await PyRun(e.code);
    if(r.ok&&r.plotly&&r.plotly.length>0)ok++;else fail.push(e.title.en+':'+String(r.err||'nofig').slice(0,50));
  }
  document.title='RESULT::plotly items ok='+ok+'/8 '+(fail.length?fail.join('|'):'');
},500));
