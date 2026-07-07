window.onerror=(m,src,l,c)=>{document.title='ERR::'+m+' @'+l;};
window.addEventListener('load',()=>setTimeout(async ()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const log=[];
  try{
    // all snippets start with a comment now
    let noComment=0;
    Object.values(PGLIB).flat().forEach(sn=>{if(!sn.c.startsWith('#'))noComment++;});
    EXAMPLES.forEach(e=>{if(!e.code.startsWith('#'))noComment++;});
    log.push('missingComments='+noComment);
    // preview shows the explanation
    show('examples');await wait(250);
    const firstPre=document.querySelector('.excard pre');
    log.push('previewComment='+(firstPre&&firstPre.textContent.trim().startsWith('#')?'ok':'BAD'));
    // spot-run 6 annotated snippets across categories
    let ok=0;const fails=[];
    for(const cat of Object.keys(PGLIB)){
      const sn=PGLIB[cat][1];
      const r=await PyRun(sn.c);
      const needFig=/plt\./.test(sn.c);
      if(r.ok&&(!needFig||r.figs.length>0)&&!/warning/i.test(r.out))ok++;
      else fails.push(cat+':'+String(r.err||'warn/nofig').slice(0,40));
    }
    const r=await PyRun(EXAMPLES[0].code);
    if(r.ok)ok++;else fails.push('ex0');
    log.push('spotRun='+ok+'/6 '+(fails.length?fails.join('|'):''));
    document.title='RESULT::'+log.join(' || ');
  }catch(e){document.title='ERR::'+e.message;}
},400));
