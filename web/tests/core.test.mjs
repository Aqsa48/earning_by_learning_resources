import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {parseCSV, inspectCSV, readWeather, weatherSummary, makePortfolio, safeWebURL, normalizeProgress, filterProjects, projectLog, LIMITS} from '../core.mjs';
import {PROJECTS, RESOURCES} from '../projects.mjs';

const sample=readFileSync(new URL('../../projects/csv-quality-report/sample.csv',import.meta.url),'utf8');
const weatherCSV=readFileSync(new URL('../../projects/weather-data/sample.csv',import.meta.url),'utf8');

test('CSV sample has the documented missing, duplicate and zero behavior',()=>{
  const {report,missingTotal}=inspectCSV(sample,'sample.csv');
  assert.equal(report.rows,4);assert.equal(report.valid_rows,4);
  assert.equal(report.duplicate_rows,1);assert.equal(missingTotal,1);
  assert.equal(report.missing_cells.rain_mm,1);assert.deepEqual(report.malformed_line_numbers,[]);
});
test('CSV supports BOM, quoted commas, multiline values, escaped quotes and CRLF',()=>{
  const parsed=parseCSV('\uFEFFname,note\r\n"A, B","said ""yes"""\r\nC,"one\r\ntwo"\r\n');
  assert.deepEqual(parsed.map(row=>row.cells),[['name','note'],['A, B','said "yes"'],['C','one\r\ntwo']]);
  assert.equal(parsed[2].line,3);
});
test('CSV handles trailing empty cells, whitespace, blank lines and physical line numbers',()=>{
  const {report}=inspectCSV('a,b\n\n"multi\nline",1\nbad\n0, \n,\n');
  assert.equal(report.rows,4);assert.deepEqual(report.malformed_line_numbers,[5]);
  assert.deepEqual(report.missing_cells,{a:1,b:2});
});
test('CSV rejects broken quotes, ambiguous headers and row overflow',()=>{
  for(const text of ['', 'a,a\n1,2', 'a,\n1,2', 'a,b\n"bad,2', 'a,b\n"x"oops,2'])assert.throws(()=>inspectCSV(text));
  assert.throws(()=>parseCSV('a\n1\n2\n3',2),/more than/);
  assert.throws(()=>inspectCSV(Array.from({length:201},(_,i)=>'column'+i).join(',')),/200 columns/);
  assert.equal(LIMITS.bytes,2097152);
});
test('CSV data stays as text, including hostile-looking column names',()=>{
  const {report,preview}=inspectCSV('__proto__,<img src=x onerror=alert(1)>\n0,<script>bad</script>');
  assert.equal(Object.getPrototypeOf(report.missing_cells),Object.prototype);
  assert.equal(report.missing_cells.__proto__,0);
  assert.equal(preview[0][1],'<script>bad</script>');
});
test('Weather counts measurements without filling missing days',()=>{
  const data=readWeather(weatherCSV);assert.equal(data.length,14);
  const summary=weatherSummary(data,'rain_mm');
  assert.deepEqual(summary,{observed:12,missing:2,sum:17,mean:17/12});
  assert.equal(weatherSummary(data,'temp_c').observed,13);
  assert.equal(data[0].rain_mm,0);assert.equal(data[3].rain_mm,null);
});
test('Weather rejects impossible dates, negative precipitation, infinity and duplicate dates',()=>{
  for(const rows of ['2026-02-30,1,2','2026-01-01,-1,2','2026-01-01,Infinity,2','2026-01-01,1,2\n2026-01-01,2,3'])assert.throws(()=>readWeather('date,rain_mm,temp_c\n'+rows));
  assert.equal(weatherSummary([{rain_mm:null}],'rain_mm').sum,null);
  assert.throws(()=>readWeather('date,rain_mm,temp_c\n'),/no observations/);
});
test('Portfolio escapes text and validates links before producing standalone HTML',()=>{
  const values={name:'<script>alert(1)</script>',role:'A & B',title:'A "project"',description:'Learning <b>HTML</b>',url:'https://example.org/project?q=1&v=2'};
  const html=makePortfolio(values);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('A &amp; B'));assert.ok(html.includes('q=1&amp;v=2'));assert.ok(!html.includes('<script src='));
  for(const url of ['javascript:alert(1)','data:text/html,bad','http://example.org','https://user:password@example.org'])assert.throws(()=>safeWebURL(url));
  assert.equal(safeWebURL(undefined),'');assert.throws(()=>makePortfolio({...values,name:''}));
});
test('Saved progress accepts only known projects, phases and bounded notes',()=>{
  const result=normalizeProgress({'csv-quality':{done:['choose','choose','fake',null],note:'x'.repeat(6000)},'unknown':{done:['plan']}});
  assert.deepEqual(result['csv-quality'].done,['choose']);assert.equal(result['csv-quality'].note.length,5000);assert.equal(result.unknown,undefined);
  assert.equal(normalizeProgress(null)['portfolio-page'].done.length,0);
  assert.ok(projectLog(PROJECTS[0],result['csv-quality']).includes('- [x] Choose'));
});
test('Project filters and guide content match available experiences',()=>{
  assert.equal(filterProjects(PROJECTS,{minutes:'60'}).length,2);
  assert.equal(filterProjects(PROJECTS,{skill:'web'}).length,1);
  assert.equal(filterProjects(PROJECTS,{skill:'data-viz',difficulty:'beginner'}).length,0);
  for(const project of PROJECTS){assert.equal(project.steps.length,5);for(const id of project.resources)assert.ok(RESOURCES.some(r=>r.id===id));}
});
