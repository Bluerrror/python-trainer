window.onerror=(m,src,l,c)=>{document.title='ERR::'+m+' @'+l;};
window.addEventListener('load',()=>setTimeout(async ()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const log=[];
  try{
    // ---- Mimo player: play unit 1 fully, answering everything correctly ----
    openUnit(0);await wait(250);
    const types={};
    while(true){
      const st=P.steps[P.i];
      types[st.type]=(types[st.type]||0)+1;
      if(st.type==='learn'){ $('checkBtn').click(); }
      else{
        if(st.type==='mc'){[...document.querySelectorAll('#opts .opt')][st.a].click();}
        else if(st.type==='gap'){[...document.querySelectorAll('#opts .opt')].find(b=>b.textContent===st.a).click();}
        else if(st.type==='typein'){const i=$('typein');i.value=st.a;i.oninput();}
        else if(st.type==='order'){const bank=[...document.querySelectorAll('#lineBank .lineTile')];
          st.lines.forEach(ln=>{bank.find(b=>b.textContent===ln&&!b.classList.contains('used')).click();});}
        $('checkBtn').click();await wait(150);
        $('contBtn').click();
      }
      await wait(120);
      if($('results')&&!$('results').classList.contains('hidden'))break;
      if(P.i>=P.steps.length)break;
    }
    log.push('player types='+JSON.stringify(types)+' correct='+P.correct+'/'+P.tasks+' stars='+(DB.stars['u0']||0));
    // ---- plotly run ----
    document.title='PROG::plotly downloading';
    const r=await PyRun('import plotly.express as px\nimport numpy as np\nx=np.linspace(0,5,50)\nfig=px.line(x=x,y=x**2)\nfig.show()\nprint("py done")');
    log.push('plotly ok='+r.ok+' figs='+(r.plotly||[]).length+' out="'+(r.out||'').trim()+'"'+(r.err?' err='+r.err.slice(0,60):''));
    // render check
    const div=document.createElement('div');document.body.appendChild(div);
    await renderPlotlyFigs(div,r.plotly);
    await wait(1500);
    log.push('rendered='+(div.querySelector('.plotlyfig svg, .plotlyfig .plot-container')?'yes':'no'));
    document.title='RESULT::'+log.join(' || ');
  }catch(e){document.title='ERR::'+e.message;}
},500));
