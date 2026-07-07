window.addEventListener('load',()=>setTimeout(async ()=>{
  const log=[];
  let r=await PyRun('import pandas as pd\nprint(pd.DataFrame({"a":[1,2]}).sum().a)');
  log.push('pandas out="'+r.out.trim().slice(0,40)+'" warn='+(/warning/i.test(r.out)?'STILL THERE':'clean'));
  r=await PyRun('import matplotlib.pyplot as plt\nplt.plot([1,2,3])\nplt.show()\nprint("done")');
  log.push('mpl out="'+r.out.trim().slice(0,40)+'" warn='+(/warning/i.test(r.out)?'STILL THERE':'clean')+' figs='+r.figs.length);
  document.title='RESULT::'+log.join(' || ');
},400));
