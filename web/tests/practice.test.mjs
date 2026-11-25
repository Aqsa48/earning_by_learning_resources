import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHALLENGES,gradeChallenge,exportProgress,importProgress,mergeProgress} from '../practice.mjs';
import {normalizeProgress,readWeather,weatherSummary} from '../core.mjs';

test('Every challenge has valid options and explanatory success/retry feedback',()=>{
  for(const [project,items]of Object.entries(CHALLENGES))for(const item of items){
    assert.ok(item.options[item.answer]);assert.equal(gradeChallenge(project,item.id,item.answer).correct,true);
    assert.equal(gradeChallenge(project,item.id,(item.answer+1)%item.options.length).correct,false);
    assert.throws(()=>gradeChallenge(project,item.id,-1));
  }
});
test('Progress roundtrip retains all projects and notes',()=>{
  const progress=normalizeProgress({'csv-quality':{done:['choose','test'],note:'My result: 4 rows.'}});
  assert.deepEqual(importProgress(exportProgress(progress),normalizeProgress),progress);
});
test('Progress rejects other formats, unknown steps, oversized notes and invalid JSON',()=>{
  for(const value of ['broken','{}',JSON.stringify({format:'learn-by-doing-progress',version:2,projects:{}}),JSON.stringify({format:'learn-by-doing-progress',version:1,projects:{unknown:{done:[],note:''}}}),JSON.stringify({format:'learn-by-doing-progress',version:1,projects:{'csv-quality':{done:['fake'],note:''}}})])assert.throws(()=>importProgress(value,normalizeProgress));
});
test('Merging preserves existing notes and unions steps without silent truncation',()=>{
  const current=normalizeProgress({'csv-quality':{done:['choose'],note:'Original notes'}});
  const incoming=normalizeProgress({'csv-quality':{done:['test'],note:'New notes'}});
  const merged=mergeProgress(current,incoming);
  assert.deepEqual(merged['csv-quality'].done,['choose','test']);
  assert.ok(merged['csv-quality'].note.includes('Original notes'));assert.ok(merged['csv-quality'].note.includes('New notes'));
  assert.equal(current['csv-quality'].note,'Original notes');
  current['csv-quality'].note='x'.repeat(5000);assert.throws(()=>mergeProgress(current,incoming),/exceed/);
});
test('Uploaded weather validates and sorts user dates while retaining all-missing measurements',()=>{
  const data=readWeather('date,rain_mm,temp_c\n2026-01-03,,\n2026-01-01,0,5\n');
  assert.equal(data[0].date,'2026-01-01');assert.equal(data[0].rain_mm,0);assert.equal(data[1].rain_mm,null);
  assert.deepEqual(weatherSummary(readWeather('date,rain_mm,temp_c\n2026-01-01,,\n'),'rain_mm'),{observed:0,missing:1,sum:null,mean:null});
});
