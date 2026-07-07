window.onerror=(m,src,l,c)=>{document.title='ERR::'+m+' @'+l;};
window.addEventListener('load',()=>setTimeout(async ()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const log=[];
  try{
    const cases={
      line:'import numpy as np\nimport matplotlib.pyplot as plt\nx=np.linspace(0,6,100)\nplt.plot(x,np.sin(x))\nplt.show()',
      hist:'import numpy as np\nimport matplotlib.pyplot as plt\nplt.hist(np.random.default_rng(0).normal(size=400),bins=30)\nplt.show()',
      threeD:'import numpy as np\nimport matplotlib.pyplot as plt\nx=np.linspace(-2,2,40)\nX,Y=np.meshgrid(x,x)\nax=plt.axes(projection="3d")\nax.plot_surface(X,Y,np.sin(X*Y),cmap="viridis")\nplt.show()',
      heat:'import numpy as np\nimport matplotlib.pyplot as plt\nplt.imshow(np.random.default_rng(1).random((30,30)),cmap="magma")\nplt.colorbar()\nplt.show()',
      polar:'import numpy as np\nimport matplotlib.pyplot as plt\nt=np.linspace(0,2*np.pi,200)\nax=plt.subplot(projection="polar")\nax.plot(t,1+np.sin(4*t))\nplt.show()',
    };
    for(const [name,code] of Object.entries(cases)){
      const r=await PyRun(code);
      const kinds=(r.figs||[]).map(f=>f[0]).join(',');
      log.push(name+':'+(r.ok&&r.figs.length?kinds:'FAIL '+String(r.err).slice(0,40)));
    }
    // viewer behaviour: render one and simulate zoom
    const r=await PyRun(cases.line);
    const div=document.createElement('div');div.style.width='400px';document.body.appendChild(div);
    renderMplFigs(div,r.figs);
    await wait(200);
    const box=div.querySelector('.mplzoom');
    log.push('viewer='+(box&&box.querySelector('svg')?'svg-ok':'MISSING'));
    box.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,clientX:50,clientY:50,bubbles:true,cancelable:true}));
    await wait(100);
    const tr=box.querySelector('.inner').style.transform;
    log.push('zoom='+(/scale\(1\.1[0-9]*\)/.test(tr)?'ok':'BAD "'+tr+'"')+' resetBtn='+(box.classList.contains('zoomed')?'shown':'hidden'));
    document.title='RESULT::'+log.join(' || ');
  }catch(e){document.title='ERR::'+e.message;}
},500));
