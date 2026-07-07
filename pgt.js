window.onerror=(m,src,l,c)=>{document.title='ERR::'+m+' @'+l;};
window.addEventListener('load',()=>setTimeout(async ()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const log=[];
  try{
    show('playground');await wait(200);
    const cats=[...document.querySelectorAll('#pgChips [data-c]')];
    log.push('cats='+cats.map(c=>c.textContent).join('|'));
    // switch to Pandas, load 3rd snippet
    cats.find(c=>c.dataset.c==='Pandas').click();await wait(150);
    const snips=[...document.querySelectorAll('#pgChips .snip')];
    log.push('pandasSnips='+snips.length);
    snips[2].click();await wait(100);
    log.push('editorLoaded='+(document.getElementById('pgCode').value.includes('describe')?'ok':'BAD'));
    // runtime spot-check: 2 random snippets from each category
    let ok=0,fail=[];
    for(const cat of Object.keys(PGLIB)){
      const picks=[0, Math.floor(PGLIB[cat].length/2)];
      for(const i of picks){
        const r=await PyRun(PGLIB[cat][i].c);
        const needFig=/plt\./.test(PGLIB[cat][i].c);
        if(r.ok&&(!needFig||r.figs.length>0))ok++;
        else fail.push(cat+'/'+PGLIB[cat][i].t+': '+String(r.err||'nofig').slice(0,50));
      }
    }
    log.push('spotRun ok='+ok+'/10 fail='+(fail.length?fail.join(' | '):'0'));
    document.title='RESULT::'+log.join(' || ');
  }catch(e){document.title='ERR::'+e.message;}
},400));
