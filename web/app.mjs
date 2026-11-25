import {initializeCSVLesson} from './csv-lesson.mjs';
import {initializeExtensions} from './extensions.mjs';
import {LIMITS, PHASES, inspectCSV, readWeather, weatherSummary, makePortfolio, normalizeProgress, filterProjects, projectLog} from './core.mjs';
import {PROJECTS, RESOURCES, REPOSITORY} from './projects.mjs';

const $ = id => document.getElementById(id);
const node = (tag, text, className) => {const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;};
const STORAGE_KEY = 'aqsa-learn-by-doing:v1';
let progress=normalizeProgress(null), storageAvailable=true, storageWarning='';
try { const saved=localStorage.getItem(STORAGE_KEY); if(saved)progress=normalizeProgress(JSON.parse(saved)); }
catch { storageWarning='Saved progress could not be read. Download your project log before leaving.';storageAvailable=false; }
let selected=PROJECTS[0], csvURL=null, portfolioURL=null, weatherURL=null, weather=null, weatherName="Synthetic sample", weatherSynthetic=true, csvBusy=false;

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));storageAvailable=true;storageWarning=''; }
  catch { storageAvailable=false;storageWarning='Browser storage is unavailable. Download your log before leaving.'; }
  updateProgress();
}
function updateProgress() {
  const n=progress[selected.id].done.length;
  $('progress-text').textContent=`${n} of 5 steps checked`;
  $('project-progress').value=n;
  $('storage-status').textContent=storageWarning||'Progress and notes are saved in this browser only.';
  $('storage-status').classList.toggle('error',!storageAvailable);
  for(const [i,phase]of PHASES.entries()){
    const details=$(`phase-${phase}`);if(!details)continue;
    details.classList.toggle('is-done',progress[selected.id].done.includes(phase));
    details.querySelector('.step-number').textContent=progress[selected.id].done.includes(phase)?'✓':String(i+1).padStart(2,'0');
  }
  renderCards();
}
function download(text, filename, type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const anchor=node('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function link(text,href,className){const anchor=node('a',text,className);anchor.href=href;return anchor;}
function table(headers, rows, missing=false) {
  const result=node('table'),head=node('thead'),hr=node('tr');
  for(const header of headers){const th=node('th',header);th.scope='col';hr.append(th);}head.append(hr);result.append(head);
  const body=node('tbody');
  for(const row of rows){const tr=node('tr');for(const value of row){const blank=missing&&String(value).trim()==='';const td=node('td',blank?'Missing':String(value),blank?'is-missing':undefined);tr.append(td);}body.append(tr);}result.append(body);return result;
}
function metrics(container, items) {
  container.replaceChildren(...items.map(([value,label])=>{const item=node('div',undefined,'metric');item.append(node('strong',value),node('span',label));return item;}));
}

const illustrations={
  table:'<rect x="18" y="7" width="94" height="61" rx="5" fill="white" stroke="#b7c3ef"/><path d="M18 24h94M18 39h94M18 54h94M51 24v44M82 24v44" fill="none" stroke="#d7def4"/><rect x="57" y="43" width="19" height="7" rx="2" fill="#f2a38e"/><circle cx="99" cy="17" r="3" fill="#8b9ce4"/>',
  chart:'<rect x="18" y="7" width="94" height="61" rx="5" fill="white" stroke="#b7d5c9"/><path d="M29 22h72M29 36h72M29 50h72" stroke="#e2eee7"/><path d="M31 55 45 40 59 47 73 26 87 32 100 19" fill="none" stroke="#409879" stroke-width="3"/><circle cx="73" cy="26" r="4" fill="#409879"/>',
  page:'<rect x="18" y="7" width="94" height="61" rx="5" fill="white" stroke="#ecc1b3"/><path d="M18 20h94" stroke="#f3dfd7"/><circle cx="26" cy="14" r="2" fill="#ec9a83"/><circle cx="33" cy="14" r="2" fill="#ecc2b5"/><rect x="29" y="30" width="38" height="6" rx="2" fill="#d18c79"/><rect x="29" y="42" width="70" height="3" rx="1" fill="#e4d2cc"/><rect x="29" y="49" width="60" height="3" rx="1" fill="#e4d2cc"/><rect x="29" y="57" width="24" height="5" rx="2" fill="#f3c0ae"/>'
};
function renderCards() {
  const results=filterProjects(PROJECTS,{skill:$('skill-filter').value,difficulty:$('difficulty-filter').value,minutes:$('time-filter').value});
  $('project-count').textContent=`${results.length} ${results.length===1?'project':'projects'} to explore`;
  const cards=results.map(project=>{
    const card=node('article',undefined,`project-card ${project.color}`),art=node('div',undefined,'card-art');
    art.setAttribute('aria-hidden','true');art.innerHTML=`<svg viewBox="0 0 130 75">${illustrations[project.icon]}</svg>`;
    const body=node('div',undefined,'card-body');body.append(node('p',project.topic,'card-topic'),node('h3',project.title),node('p',project.description));
    const meta=node('div',undefined,'card-meta');meta.append(node('span',project.difficulty==='beginner'?'Beginner':'Some Python experience'),node('span',`About ${project.minutes} min`));body.append(meta);
    const count=progress[project.id].done.length;
    const start=link(`${count?'Continue':'Start'} ${project.shortTitle}`,`#project=${project.id}`,'button secondary card-start');
    start.addEventListener('click',event=>{if(selected.id===project.id&&location.hash===`#project=${project.id}`){event.preventDefault();$('workspace').scrollIntoView({block:'start'});}});
    body.append(start);if(count)body.append(node('p',`${count} of 5 steps checked in this browser`,'card-progress'));
    card.append(art,body);return card;
  });
  $('project-cards').replaceChildren(...(cards.length?cards:[node('p','No projects match these choices. Try another filter or clear the filters.','empty-filters')]));
}

function renderWorkspace(project) {
  selected=project;
  extensions.showChallenges(project);
  $('workspace-topic').textContent=project.topic.toUpperCase()+' / GUIDED PROJECT';
  $('workspace-title').textContent=project.shortTitle;
  $('workspace-outcome').textContent=project.outcome;
  $('prerequisites').textContent='Before you start: '+project.prerequisites;
  $('reflection').value=progress[project.id].note;
  $('project-steps').replaceChildren(...project.steps.map((step,i)=>{
    const details=node('details',undefined,'phase');details.id=`phase-${step.id}`;
    if(i===0)details.open=true;
    const summary=node('summary');summary.append(node('span',String(i+1).padStart(2,'0'),'step-number'),node('span',PHASES[i][0].toUpperCase()+PHASES[i].slice(1),'phase-title'));
    const body=node('div',undefined,'phase-body');body.append(node('h4',step.title),node('p',step.text));
    if(step.code){const pre=node('pre');pre.append(node('code',step.code));body.append(pre);}
    const label=node('label',undefined,'complete-step'),checkbox=node('input');checkbox.type='checkbox';checkbox.checked=progress[project.id].done.includes(step.id);
    checkbox.addEventListener('change',()=>{const set=new Set(progress[project.id].done);checkbox.checked?set.add(step.id):set.delete(step.id);progress[project.id].done=PHASES.filter(id=>set.has(id));saveProgress();});
    label.append(checkbox,node('span',step.task));body.append(label);details.append(summary,body);return details;
  }));
  $('extension-list').replaceChildren(...project.extensions.map(text=>node('li',text)));
  const downloadLink=link(project.downloadLabel,project.download);downloadLink.download='';
  $('project-links').replaceChildren(downloadLink,link('Read the full project guide',`${REPOSITORY}/tree/main/${project.source}`));
  for(const id of ['csv','weather','portfolio'])$(`${id}-tool`).hidden=({csv:'csv-quality',weather:'weather-story',portfolio:'portfolio-page'}[id]!==project.id);
  for(const card of document.querySelectorAll('.resource-card'))card.classList.toggle('is-related',project.resources.includes(card.dataset.resource));
  if(project.id==='weather-story')loadWeather();
  if(project.id==='portfolio-page')updatePortfolio();
  updateProgress();
}
function fromHash(scroll=true) {
  if(!location.hash.startsWith('#project='))return;
  const id=location.hash.slice('#project='.length), project=PROJECTS.find(project=>project.id===id);
  if(!project)return;
  renderWorkspace(project);if(scroll)$('workspace').scrollIntoView({block:'start'});
}
for(const id of ['skill-filter','difficulty-filter','time-filter'])$(id).addEventListener('change',renderCards);
$('clear-filters').addEventListener('click',()=>{for(const id of ['skill-filter','difficulty-filter','time-filter'])$(id).value='all';renderCards();});
window.addEventListener('hashchange',()=>fromHash());
$('reflection').addEventListener('input',()=>{progress[selected.id].note=$('reflection').value;saveProgress();});
$('download-log').addEventListener('click',()=>download(projectLog(selected,progress[selected.id]),`${selected.id}-project-log.md`,'text/markdown;charset=utf-8'));

function renderResources() {
  $('resource-list').replaceChildren(...RESOURCES.map(resource=>{
    const card=node('article',undefined,'resource-card');card.dataset.resource=resource.id;
    const heading=node('h3');heading.append(link(resource.title,resource.url));
    card.append(node('p',resource.topic,'resource-topic'),heading,node('p',resource.description),node('p','Before you start: '+resource.prerequisite,'resource-requirements'));return card;
  }));
}

async function runCSV(loader, filename) {
  if(csvBusy)return;csvLesson.setCurrentReport(null);csvBusy=true;$('csv-sample').disabled=true;$('csv-file').disabled=true;
  $('csv-results').hidden=true;$('csv-download').hidden=true;
  if(csvURL)URL.revokeObjectURL(csvURL);csvURL=null;
  $('csv-status').textContent='Reading the CSV on your device…';$('csv-status').classList.remove('error');
  try {
    const text=await loader();const result=inspectCSV(text,filename), report=result.report;
    csvLesson.setCurrentReport(report);
    metrics($('csv-stats'),[[report.rows,'data rows'],[result.missingTotal,'missing cells'],[report.duplicate_rows,'duplicate rows']]);
    $('missing-table').replaceChildren(table(['Column','Missing cells'],report.columns.map(name=>[name,report.missing_cells[name]])));
    $('csv-preview').replaceChildren(table(report.columns,result.preview,true));
    const malformed=report.malformed_line_numbers;
    $('csv-malformed').textContent=malformed.length?`${malformed.length} malformed ${malformed.length===1?'row':'rows'} excluded from missing/duplicate counts. Physical starting lines: ${malformed.slice(0,20).join(', ')}${malformed.length>20?'…':''}.`:'All rows have the expected number of cells.';
    csvURL=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}));
    $('csv-download').href=csvURL;$('csv-download').download='csv-quality-report.json';$('csv-download').hidden=false;$('csv-results').hidden=false;
    $('csv-status').textContent=`Checked ${filename}. Nothing was uploaded.`;
  } catch(error){$('csv-status').textContent=error.message||'Could not read the CSV.';$('csv-status').classList.add('error');}
  finally {csvBusy=false;$('csv-sample').disabled=false;$('csv-file').disabled=false;}
}
$('csv-sample').addEventListener('click',()=>runCSV(async()=>{const response=await fetch('downloads/csv-sample.csv');if(!response.ok)throw Error('The sample could not be loaded. Try the downloadable file instead.');return response.text();},'csv-sample.csv'));
$('csv-file').addEventListener('change',()=>{const file=$('csv-file').files[0];if(!file)return;runCSV(async()=>{if(file.size>LIMITS.bytes)throw Error('This checker accepts files up to 2 MiB. Use the Python script for larger inputs.');return file.text();},file.name);});

const svgNode=(name,attributes={},text)=>{const element=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value]of Object.entries(attributes))element.setAttribute(key,value);if(text!==undefined)element.textContent=text;return element;};
async function loadWeather() {
  if(weather){drawWeather();return;}
  $('weather-status').textContent='Loading the synthetic sample…';$('weather-status').classList.remove('error');
  try{const response=await fetch('downloads/weather-sample.csv');if(!response.ok)throw Error('Weather sample could not be loaded.');weather=readWeather(await response.text());weatherName='Synthetic sample';weatherSynthetic=true;if(selected.id==='weather-story')drawWeather();}
  catch(error){$('weather-status').textContent=error.message;$('weather-status').classList.add('error');}
}
function drawWeather() {
  if(!weather)return;
  $('weather-description').textContent=weatherSynthetic?'Fourteen days of synthetic observations. Switch the view and inspect the gaps.':'Your uploaded observations. Measurements and dates are read locally; check their units and provenance before interpreting results.';
  const metric=$('weather-metric').value, rain=metric==='rain_mm', unit=rain?'mm':'°C', summary=weatherSummary(weather,metric);
  metrics($('weather-stats'),[[summary.observed,'observed readings'],[summary.missing,'missing readings'],[rain?`${(summary.sum===null?'—':summary.sum.toFixed(1))} mm`:`${(summary.mean===null?'—':summary.mean.toFixed(1))} °C`,rain?'measured total':'observed mean']]);
  const svg=$('weather-chart');svg.replaceChildren(svgNode('title',{id:'chart-title'},`${weatherSynthetic?'Synthetic':'Uploaded'} daily ${rain?'rainfall':'temperature'}`),svgNode('desc',{id:'chart-description'},`${weather.length} dates, ${summary.observed} observed values and ${summary.missing} missing values. A data table follows the chart.`));
  const values=weather.map(row=>row[metric]).filter(value=>value!==null);
  const left=48,top=24,width=447,height=208;
  let min=rain?0:(values.length?Math.floor(Math.min(...values)-1):0),max=values.length?Math.ceil(Math.max(...values)+1):1;if(max===min)max=min+1;
  const times=weather.map(row=>Date.parse(row.date+'T00:00:00Z'));
  const span=Math.max(86400000,times.at(-1)-times[0]);
  const barHalf=Math.max(.3,Math.min(9,(width-24)*86400000/span*.35));
  const x=index=>left+12+(times[index]-times[0])/span*(width-24),y=value=>top+height-(value-min)/(max-min)*height;
  for(let i=0;i<=4;i++){const value=min+(max-min)*i/4;svg.append(svgNode('line',{x1:left,x2:left+width,y1:y(value),y2:y(value),stroke:'#e8edf5'}),svgNode('text',{x:left-9,y:y(value)+4,'text-anchor':'end','font-size':11,fill:'#66738d'},Number(value.toFixed(1)).toString()));}
  svg.append(svgNode('text',{x:left,y:14,'font-size':11,fill:'#52617c'},unit));
  if(rain){for(const [i,row]of weather.entries()){const value=row[metric];if(value===null){svg.append(svgNode('path',{d:`M${x(i)-4} ${top+height-7}l8 8m-8 0l8-8`,stroke:'#ba5038','stroke-width':2}));continue;}svg.append(svgNode('rect',{x:x(i)-barHalf,y:y(value),width:barHalf*2,height:Math.max(1,y(0)-y(value)),rx:2,fill:'#596ed3'}));}}
  else {let segment=[];const flush=()=>{if(segment.length)svg.append(svgNode('polyline',{points:segment.join(' '),fill:'none',stroke:'#bd5d43','stroke-width':2.5}));segment=[];};for(const [i,row]of weather.entries()){if(row[metric]===null){flush();continue;}if(i>0&&times[i]-times[i-1]>86400000)flush();segment.push(`${x(i)},${y(row[metric])}`);svg.append(svgNode('circle',{cx:x(i),cy:y(row[metric]),r:3.5,fill:'#bd5d43'}));}flush();}
  for(const i of [...new Set([0,Math.floor((weather.length-1)/2),weather.length-1])])if(weather[i])svg.append(svgNode('text',{x:x(i),y:top+height+24,'text-anchor':'middle','font-size':11,fill:'#66738d'},weather[i].date.slice(5)));
  $('weather-table').replaceChildren(table(['Date','Rain (mm)','Temp (°C)'],weather.map(row=>[row.date,row.rain_mm??'',row.temp_c??'']),true));
  const absent=Math.round((times.at(-1)-times[0])/86400000)+1-weather.length;
  $('weather-status').textContent=`${weatherName}: ${weather.length} dated rows; ${absent} dates absent between first and last. Missing readings and absent dates are not zeros.`;
  if(weatherURL)URL.revokeObjectURL(weatherURL);
  const serialized=new XMLSerializer().serializeToString(svg);weatherURL=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml'}));
  $('weather-chart-download').href=weatherURL;$('weather-chart-download').download=`${weatherSynthetic?'synthetic':'uploaded'}-${metric}.svg`;$('weather-chart-download').hidden=false;
}
$('weather-metric').addEventListener('change',drawWeather);
$('weather-reset').addEventListener('click',()=>{weather=null;$('weather-file').value='';loadWeather();});
$('weather-file').addEventListener('change',async()=>{const file=$('weather-file').files[0];if(!file)return;try{if(file.size>LIMITS.bytes)throw Error('Weather files must be no larger than 2 MiB.');const parsed=readWeather(await file.text());weather=parsed;weatherName=file.name;weatherSynthetic=false;drawWeather();$('weather-status').classList.remove('error');}catch(error){$('weather-status').textContent=`Upload rejected: ${error.message} The previous chart has not been replaced.`;$('weather-status').classList.add('error');}});

function updatePortfolio() {
  if(portfolioURL)URL.revokeObjectURL(portfolioURL);portfolioURL=null;$('portfolio-download').hidden=true;
  $('portfolio-status').classList.remove('error');
  try{const values=Object.fromEntries(new FormData($('portfolio-form')));const html=makePortfolio(values);$('portfolio-preview').srcdoc=html;portfolioURL=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));$('portfolio-download').href=portfolioURL;$('portfolio-download').download='portfolio.html';$('portfolio-download').hidden=false;$('portfolio-status').textContent='Preview updated. Download your HTML file when it is ready.';}
  catch(error){$('portfolio-status').textContent=error.message;$('portfolio-status').classList.add('error');}
}
$('portfolio-form').addEventListener('submit',event=>{event.preventDefault();updatePortfolio();});
$('portfolio-form').addEventListener('input',()=>{$('portfolio-download').hidden=true;$('portfolio-status').textContent='Your text changed. Update the preview before downloading.';});

const csvLesson=initializeCSVLesson({download});
const extensions=initializeExtensions({getProgress:()=>progress,setProgress:value=>{progress=value;saveProgress();renderWorkspace(selected);},download});
renderResources();renderWorkspace(PROJECTS[0]);fromHash(true);
