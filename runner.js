/* Pyodide runner: real CPython (WebAssembly) in the browser.
   Supports numpy / scipy / pandas / matplotlib — packages load on first import.
   First use needs internet (CDN); the service worker caches everything after that. */
(function(){
  const PYODIDE_VERSION='0.26.4';
  const CDN='https://cdn.jsdelivr.net/pyodide/v'+PYODIDE_VERSION+'/full/';
  let pyodide=null, loading=null, stdoutBuf=[];

  window.pyReady=function(){return !!pyodide;};

  function injectScript(src){
    return new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src));
      document.head.appendChild(s);
    });
  }

  async function ensurePyodide(status){
    if(pyodide)return pyodide;
    if(loading)return loading;
    loading=(async()=>{
      status&&status((window.STR&&t('loadingPy'))||'Loading Python…');
      if(typeof loadPyodide==='undefined')await injectScript(CDN+'pyodide.js');
      const py=await loadPyodide({indexURL:CDN});
      py.setStdout({batched:s=>stdoutBuf.push(s)});
      py.setStderr({batched:s=>stdoutBuf.push(s)});
      // force the AGG backend so matplotlib renders to PNG bytes we can show
      py.runPython("import os\nos.environ['MPLBACKEND']='AGG'");
      py.runPython(`
def __grab_figs():
    import sys
    if 'matplotlib' not in sys.modules:
        return []
    import matplotlib.pyplot as plt, io, base64
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format='png', dpi=110, bbox_inches='tight')
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return out
`);
      pyodide=py;
      return py;
    })();
    try{return await loading;}
    finally{loading=null;}
  }

  /* Run code; returns {ok, out, err, figs:[b64...]} */
  window.PyRun=async function(code,status){
    try{
      const py=await ensurePyodide(status);
      status&&status(t?t('loadingPkg'):'Loading packages…');
      try{await py.loadPackagesFromImports(code);}catch(e){/* unknown imports fail at runtime instead */}
      status&&status(t?t('running'):'Running…');
      stdoutBuf=[];
      let err=null;
      try{
        await py.runPythonAsync(code);
      }catch(e){
        err=String(e.message||e);
        // trim pyodide-internal frames for readability
        const cut=err.indexOf('File "<exec>"');
        if(cut>0)err='Traceback (most recent call last):\n  '+err.slice(cut);
      }
      let figs=[];
      try{const proxy=py.runPython('__grab_figs()');figs=proxy.toJs();proxy.destroy&&proxy.destroy();}catch(e){}
      const out=stdoutBuf.join('\n');
      if(err)return {ok:false,err:(out?out+'\n':'')+err,out:out,figs:figs};
      return {ok:true,out:out,figs:figs};
    }catch(e){
      return {ok:false,err:'⚠️ '+String(e.message||e)+(navigator.onLine===false?'\n(offline? the first run needs internet)':''),figs:[]};
    }
  };
})();
