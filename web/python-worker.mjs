// Loaded only when the visitor chooses Run Python. No user files are passed in.
let runtime;
let printed=0;
const sendOutput=text=>{if(printed>=16000)return;const chunk=String(text).slice(0,16000-printed);printed+=chunk.length;self.postMessage({type:'output',text:chunk});};
self.onmessage=async event=>{
  try{
    if(!runtime){const {loadPyodide}=await import('https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs');runtime=await loadPyodide();}
    self.postMessage({type:'ready'});printed=0;
    runtime.setStdout({batched:sendOutput});runtime.setStderr({batched:sendOutput});
    const globals=runtime.globals.get('dict')();
    try{const value=await runtime.runPythonAsync(event.data.code,{globals});if(value!==undefined&&value!==null){sendOutput(String(value));if(typeof value.destroy==='function')value.destroy();}}
    finally{globals.destroy();}
    self.postMessage({type:'done'});
  }catch(error){self.postMessage({type:'error',text:String(error.message||error).slice(0,4000)});}
};
