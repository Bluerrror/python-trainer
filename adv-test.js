window.addEventListener('load',()=>setTimeout(async ()=>{
  const log=[];
  const idx={};EXAMPLES.forEach((e,i)=>idx[e.title.en]=i);
  const targets=['Mandelbrot set','ODE: damped pendulum','K-means clustering','Filter a noisy signal (FFT)',
    '3-D surface plot','Radar / spider chart','Stock-style cumulative returns','Correlation heatmap',
    'Pivot table heat view','Seasonality + trend decomposition','Monte-Carlo integration','OOP: bank account class'];
  for(const t of targets){
    const e=EXAMPLES[idx[t]];
    if(!e){log.push(t+': MISSING');continue;}
    const r=await PyRun(e.code);
    const expectFig=/plt\./.test(e.code);
    const ok=r.ok&&(!expectFig||r.figs.length>0);
    log.push((t.split(' ')[0]||t)+':'+(ok?'ok':'FAIL '+String(r.err||'nofig').slice(0,60)));
  }
  // lesson-block codes of new units 9-14
  let lok=0,lfail=[];
  for(let u=8;u<UNITS.length;u++){
    for(const b of UNITS[u].blocks){
      if(!b.code)continue;
      const r=await PyRun(b.code);
      if(r.ok)lok++;else lfail.push('u'+(u+1)+':'+String(r.err).slice(0,50));
    }
  }
  log.push('unitBlocks ok='+lok+' fail='+lfail.length+(lfail.length?' '+lfail.join(' | '):''));
  document.title='RESULT::'+log.join(' || ');
},600));
