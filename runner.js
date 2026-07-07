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
      // force the AGG backend so matplotlib renders to PNG bytes we can show,
      // and silence noisy library warnings that only confuse learners
      py.runPython(
        "import os, warnings\n"+
        "os.environ['MPLBACKEND']='AGG'\n"+
        "warnings.filterwarnings('ignore', message='(?s).*[Pp]yarrow.*')\n"+
        "warnings.filterwarnings('ignore', message='(?s).*non-GUI backend.*')\n"+
        "warnings.filterwarnings('ignore', message='(?s).*cannot show the figure.*')\n"+
        "warnings.filterwarnings('ignore', category=FutureWarning, message='(?s).*deprecated.*')");
      py.runPython("__plotly_figs = []");
      py.runPython(`
def __setup_plotly():
    import sys
    if 'plotly' not in sys.modules:
        return
    import plotly.basedatatypes as _pbd
    if getattr(_pbd.BaseFigure, '_pt_patched', False):
        return
    def _show(self, *a, **k):
        __plotly_figs.append(self.to_json())
    _pbd.BaseFigure.show = _show
    _pbd.BaseFigure._pt_patched = True
`);
      py.runPython(`
def __grab_figs():
    import sys
    if 'matplotlib' not in sys.modules:
        return []
    import matplotlib.pyplot as plt, io, base64
    out = []
    for n in plt.get_fignums():
        f = plt.figure(n)
        done = False
        try:
            sbuf = io.StringIO()
            f.savefig(sbuf, format='svg', bbox_inches='tight')
            svg = sbuf.getvalue()
            if len(svg) < 1500000:          # huge scatter clouds fall back to PNG
                out.append(['svg', svg])
                done = True
        except Exception:
            pass
        if not done:
            buf = io.BytesIO()
            f.savefig(buf, format='png', dpi=110, bbox_inches='tight')
            out.append(['png', base64.b64encode(buf.getvalue()).decode()])
    plt.close('all')
    return out
`);
      pyodide=py;
      return py;
    })();
    try{return await loading;}
    finally{loading=null;}
  }

  /* Run code; returns {ok, out, err, figs:[b64 pngs], plotly:[fig json]} */
  window.PyRun=async function(code,status){
    try{
      const py=await ensurePyodide(status);
      status&&status(t?t('loadingPkg'):'Loading packages…');
      try{await py.loadPackagesFromImports(code);}catch(e){/* unknown imports fail at runtime instead */}
      if(/\bplotly\b/.test(code)){
        try{
          // plotly.express depends on pandas + numpy under the hood
          await py.loadPackage(['micropip','pandas','numpy']);
          await py.runPythonAsync("import micropip\ntry:\n    import plotly\nexcept Exception:\n    await micropip.install('plotly')\n    import plotly");
        }catch(e){}
      }
      status&&status(t?t('running'):'Running…');
      stdoutBuf=[];
      try{py.runPython("__plotly_figs.clear()\n__setup_plotly()");}catch(e){}
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
      try{const proxy=py.runPython('__grab_figs()');figs=proxy.toJs({depth:2});proxy.destroy&&proxy.destroy();}catch(e){}
      let plotly=[];
      try{py.runPython("__setup_plotly()");const pj=py.runPython("import json as _j; _j.dumps(__plotly_figs)");plotly=JSON.parse(pj);}catch(e){}
      const out=stdoutBuf.join('\n');
      if(err)return {ok:false,err:(out?out+'\n':'')+err,out:out,figs:figs,plotly:plotly};
      return {ok:true,out:out,figs:figs,plotly:plotly};
    }catch(e){
      return {ok:false,err:'⚠️ '+String(e.message||e)+(navigator.onLine===false?'\n(offline? the first run needs internet)':''),figs:[]};
    }
  };
})();
