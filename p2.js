window.addEventListener('load',()=>setTimeout(async ()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const r=await PyRun('import plotly.express as px\nimport numpy as np\nx=np.linspace(0,5,50)\nfig=px.line(x=x,y=x**2)\nfig.show()\nprint("py done")');
  let msg='plotly ok='+r.ok+' figs='+(r.plotly||[]).length+(r.err?' err='+r.err.slice(0,80):'');
  if(r.ok&&r.plotly&&r.plotly.length){
    const div=document.createElement('div');document.body.appendChild(div);
    await renderPlotlyFigs(div,r.plotly);
    await wait(2500);
    msg+=' rendered='+(div.querySelector('.plotlyfig svg, .plotlyfig .plot-container')?'yes':'no');
  }
  document.title='RESULT::'+msg;
},500));
