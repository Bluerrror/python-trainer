window.addEventListener('load',()=>setTimeout(async ()=>{
  const log=[];
  let r=await PyRun('import pandas as pd\nprint(pd.DataFrame({"a":[1,2]}).sum().a)');
  log.push('pandas="'+r.out.trim().slice(0,30)+'" '+(/warning/i.test(r.out)?'STILL':'clean'));
  r=await PyRun('import matplotlib.pyplot as plt\nplt.plot([1,2,3])\nplt.show()\nprint("done")');
  log.push('mpl="'+r.out.trim().slice(0,20)+'" '+(/warning/i.test(r.out)?'STILL':'clean')+' figs='+r.figs.length);
  // examples categories in UI
  const cats=['All',...new Set(EXAMPLES.map(e=>e.cat))];
  log.push('exampleCats='+cats.join(','));
  document.title='RESULT::'+log.join(' || ');
},400));
