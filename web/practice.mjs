export const CHALLENGES = {
  'csv-quality': [
    {id:'zero',question:'Which rainfall cell is missing?',options:['0','An empty cell','2.5'],answer:1,hint:'A measurement of zero still tells you something.',explanation:'An empty cell is missing. Zero means rainfall was measured and none was observed.'},
    {id:'duplicate',question:'The sample repeats Alpine-B, 2026-01-01, 0 twice. How many duplicate rows are reported?',options:['0','1','2'],answer:1,hint:'Count repeats after the first occurrence.',explanation:'The first row is retained as the original; the second identical row adds one duplicate.'}
  ],
  'weather-story': [
    {id:'coverage',question:'We measured 17 mm across 12 days; 2 days are missing. What can we conclude?',options:['The full 14-day total is exactly 17 mm','The observed total is 17 mm; the full total is unknown','The missing days had no rain'],answer:1,hint:'Missing observations do not establish zero rainfall.',explanation:'17 mm is the sum of the observed measurements. The two missing days could change the full-period total.'},
    {id:'mean',question:'Which calculation gives the mean of the observed rainfall readings?',options:['17 ÷ 14','17 ÷ 12','17 ÷ 2'],answer:1,hint:'Use the number of observations, including measured zero days.',explanation:'There are 12 observed readings, so the observed mean is 17/12, approximately 1.42 mm.'}
  ],
  'portfolio-page': [
    {id:'evidence',question:'Which project description gives a reader useful evidence?',options:['I am an amazing data scientist','I checked the sample: 4 rows, 1 missing cell, 1 duplicate','This project guarantees a job'],answer:1,hint:'Choose a specific result someone could verify.',explanation:'A concrete input, test, and result gives the reader evidence. Broad claims and guarantees do not.'},
    {id:'link',question:'Which text best describes a link to your source code?',options:['Click here','More','View CSV checker source code'],answer:2,hint:'Make the destination understandable without surrounding text.',explanation:'Descriptive link text helps all readers, including people navigating a list of links with a screen reader.'}
  ]
};

export function gradeChallenge(project,id,answer) {
  const challenge=CHALLENGES[project]?.find(item=>item.id===id);
  if(!challenge||!Number.isInteger(answer)||answer<0||answer>=challenge.options.length)throw Error('Choose an answer before checking.');
  return {correct:answer===challenge.answer,feedback:answer===challenge.answer?`Correct. ${challenge.explanation}`:`Try again. ${challenge.hint}`};
}

export function exportProgress(progress) {
  return JSON.stringify({format:'learn-by-doing-progress',version:1,projects:progress},null,2)+'\n';
}

export function importProgress(text,normalize) {
  if(text.length>100000)throw Error('Progress files must be smaller than 100 KB.');
  let data;try{data=JSON.parse(text);}catch{throw Error('This file is not valid JSON.');}
  if(data?.format!=='learn-by-doing-progress'||data.version!==1||!data.projects||typeof data.projects!=='object'||Array.isArray(data.projects))throw Error('Choose a Learn by Doing progress export (version 1).');
  const ids=['csv-quality','weather-story','portfolio-page'];
  if(Object.keys(data.projects).some(id=>!ids.includes(id)))throw Error('The file contains an unknown project.');
  for(const value of Object.values(data.projects)){
    if(!value||!Array.isArray(value.done)||value.done.some(id=>!['choose','plan','build','test','reflect'].includes(id))||typeof value.note!=='string'||value.note.length>5000)throw Error('The progress data has invalid steps or notes.');
  }
  return normalize(data.projects);
}

export function mergeProgress(current,incoming) {
  const merged={};
  for(const id of Object.keys(current)){
    const a=current[id],b=incoming[id];
    merged[id]={done:[...new Set([...a.done,...b.done])],note:!b.note||b.note===a.note?a.note:!a.note?b.note:`${a.note}\n\nImported notes:\n${b.note}`};
    if(merged[id].note.length>5000)throw Error('Combined notes exceed 5,000 characters. Shorten or download your notes before importing.');
  }
  return merged;
}
