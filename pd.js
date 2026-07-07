window.addEventListener('load',()=>setTimeout(async ()=>{
  const log=[];
  let r=await PyRun('import plotly\nprint(plotly.__version__)');
  log.push('ver='+r.out.trim());
  r=await PyRun('import plotly.basedatatypes as b\nprint("patched:", getattr(b.BaseFigure, "_pt_patched", False))\nprint("figsvar:", type(__plotly_figs).__name__, len(__plotly_figs))');
  log.push('state="'+r.out.trim().replace(/\n/g,'; ')+'"'+(r.err?' err='+r.err.slice(0,80):''));
  r=await PyRun('import plotly.express as px\nfig=px.line(x=[1,2,3],y=[1,4,9])\nprint("showtype:", fig.show.__name__ if hasattr(fig.show,"__name__") else fig.show)\nfig.show()\nprint("after show:", len(__plotly_figs))');
  log.push('run="'+r.out.trim().replace(/\n/g,'; ')+'"'+(r.err?' err='+r.err.slice(0,100):''));
  document.title='RESULT::'+log.join(' || ');
},500));
