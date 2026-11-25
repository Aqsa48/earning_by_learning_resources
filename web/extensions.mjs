import {CHALLENGES,gradeChallenge,exportProgress,importProgress,mergeProgress} from './practice.mjs';
import {normalizeProgress,safeWebURL} from './core.mjs';
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};
const starter=`import csv, io

sample = "station,rain_mm\\nA,0\\nB,\\nC,2.5\\n"
rows = list(csv.DictReader(io.StringIO(sample)))

# Count empty cells. A measured zero is not missing.
missing = sum(row["rain_mm"].strip() == "" for row in rows)
print("Rows:", len(rows))
print("Missing rainfall:", missing)
assert missing == 1, "Expected one missing rainfall observation"
print("Check passed!")
`;

export function initializeExtensions({getProgress,setProgress,download}) {
  function showChallenges(project){
    $('challenge-list').replaceChildren(...CHALLENGES[project.id].map(challenge=>{
      const form=el('form'),fieldset=el('fieldset'),legend=el('legend',challenge.question);fieldset.append(legend);
      challenge.options.forEach((answer,i)=>{const label=el('label'),input=el('input');input.type='radio';input.name=challenge.id;input.value=String(i);label.append(input,el('span',answer));fieldset.append(label);});
      const button=el('button','Check answer');button.className='button secondary';button.type='submit';
      const hint=el('details');hint.append(el('summary','Show a hint'),el('p',challenge.hint));
      const feedback=el('p');feedback.setAttribute('role','status');
      form.append(fieldset,button,hint,feedback);
      form.addEventListener('submit',event=>{event.preventDefault();const chosen=new FormData(form).get(challenge.id);if(chosen===null){feedback.textContent='Choose an answer before checking.';return;}feedback.textContent=gradeChallenge(project.id,challenge.id,Number(chosen)).feedback;});
      return form;
    }));
    $('challenge-project').textContent=project.shortTitle;
  }
  $('progress-export').addEventListener('click',()=>download(exportProgress(getProgress()),'learn-by-doing-progress.json','application/json'));
  let pending=null;
  $('progress-import').addEventListener('change',async()=>{
    pending=null;$('progress-confirm').hidden=true;const file=$('progress-import').files[0];if(!file)return;
    try{if(file.size>100000)throw Error('Progress files must be smaller than 100 KB.');pending=importProgress(await file.text(),normalizeProgress);$('progress-import-status').textContent='Valid export. Import will combine checked steps and preserve existing notes. Review your choice, then select Merge progress.';$('progress-confirm').hidden=false;}
    catch(error){$('progress-import-status').textContent=error.message;}
  });
  $('progress-confirm').addEventListener('click',()=>{if(!pending)return;try{const merged=mergeProgress(getProgress(),pending);setProgress(merged);pending=null;$('progress-confirm').hidden=true;$('progress-import-status').textContent='Progress merged. Existing notes were preserved.';}catch(error){$('progress-import-status').textContent=error.message;}});

  $('python-code').value=starter;
  let worker=null,timer=null;
  function finish(message){clearTimeout(timer);timer=null;if(worker)worker.terminate();worker=null;$('python-run').disabled=false;$('python-stop').disabled=true;$('python-status').textContent=message;}
  $('python-run').addEventListener('click',()=>{
    $('python-output').textContent='';$('python-run').disabled=true;$('python-stop').disabled=false;
    $('python-status').textContent='Loading Python from jsDelivr. The first run downloads the runtime and can take a minute…';
    worker=new Worker(new URL('./python-worker.mjs',import.meta.url),{type:'module'});
    timer=setTimeout(()=>finish('Python loading timed out. Check your connection and try again.'),90000);
    worker.onmessage=event=>{const data=event.data;if(data.type==='ready'){clearTimeout(timer);timer=setTimeout(()=>finish('Execution stopped after 10 seconds. Simplify your code or try again.'),10000);$('python-status').textContent='Running Python on this device…';}
      else if(data.type==='output')$('python-output').textContent+=data.text+'\n';
      else if(data.type==='done')finish('Run complete. Edit the code and try another input.');
      else if(data.type==='error'){const runtimeReady=$('python-status').textContent.startsWith('Running');$('python-output').textContent+=data.text+'\n';finish(runtimeReady?'Python reported an error. Read the output, then edit and retry.':'Python could not load. Check your connection; the other tools still work.');}};
    worker.onerror=()=>finish('Python could not start. Check your connection and browser support.');
    worker.postMessage({code:$('python-code').value});
  });
  $('python-stop').addEventListener('click',()=>finish('Stopped. You can edit the code and run again.'));
  $('python-reset').addEventListener('click',()=>{$('python-code').value=starter;$('python-status').textContent='Sample restored. Expected output: 3 rows and 1 missing rainfall observation.';});
  $('python-download').addEventListener('click',()=>download($('python-code').value,'my-csv-experiment.py','text/x-python'));

  async function gallery(){try{const response=await fetch('./gallery.json');if(!response.ok)throw Error('Gallery unavailable.');const items=await response.json();$('gallery-cards').replaceChildren(...items.map(item=>{const card=el('article');card.className='resource-card';card.append(el('p',item.kind),el('h3',item.title),el('p',item.result),el('p','Verification: '+item.verification));const link=el('a','View source and reproduce');link.href=safeWebURL(item.source);card.append(link);return card;}));}catch{$('gallery-cards').textContent='The gallery could not load. You can still explore all examples in the GitHub repository.';}}
  gallery();return {showChallenges};
}
