export const LIMITS = Object.freeze({bytes: 2 * 1024 * 1024, rows: 20000, columns: 200});
export const PHASES = ['choose', 'plan', 'build', 'test', 'reflect'];
export const PROJECT_IDS = ['csv-quality', 'weather-story', 'portfolio-page'];

export function parseCSV(input, maxRows = LIMITS.rows) {
  const text = String(input).replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false, closed = false, touched = false;
  let line = 1, startLine = 1;
  const finish = () => {
    if (touched || row.length || field.length || closed) {
      row.push(field);
      rows.push({cells: row, line: startLine});
      if (rows.length > maxRows + 1) throw Error(`Use the Python project for more than ${maxRows.toLocaleString()} rows.`);
    }
    row = []; field = ''; closed = false; touched = false;
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i+1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else {
        field += char;
        if (char === '\n' || (char === '\r' && text[i+1] !== '\n')) line++;
      }
      continue;
    }
    if (char === '\r' || char === '\n') {
      finish();
      if (char === '\r' && text[i+1] === '\n') i++;
      line++; startLine = line;
    } else if (char === ',') {
      row.push(field); field = ''; closed = false; touched = true;
    } else if (char === '"' && field === '' && !closed) {
      quoted = true; touched = true;
    } else {
      if (closed || char === '"') throw Error(`Unexpected character after or inside quotes on line ${line}.`);
      field += char; touched = true;
    }
  }
  if (quoted) throw Error(`Unclosed quoted field starting on line ${startLine}.`);
  finish();
  return rows;
}

export function inspectCSV(text, filename = 'local.csv') {
  const parsed = parseCSV(text);
  if (!parsed.length) throw Error('The CSV is empty. Include a header row.');
  const header = parsed[0].cells;
  if (header.length > LIMITS.columns) throw Error('Use the Python project for CSVs with more than 200 columns.');
  if (header.some(name => !name.trim()) || new Set(header).size !== header.length)
    throw Error('Column names must be nonempty and unique.');
  const missing = header.map(() => 0), seen = new Set(), malformed = [], preview = [];
  let duplicates = 0, valid = 0;
  for (const entry of parsed.slice(1)) {
    if (entry.cells.length !== header.length) { malformed.push(entry.line); continue; }
    valid++;
    const key = JSON.stringify(entry.cells);
    if (seen.has(key)) duplicates++; else seen.add(key);
    entry.cells.forEach((value,i) => { if (!value.trim()) missing[i]++; });
    if (preview.length < 5) preview.push(entry.cells);
  }
  return {
    report: {file: filename, rows: parsed.length - 1, valid_rows: valid, columns: header,
      missing_cells: Object.fromEntries(header.map((name,i) => [name,missing[i]])),
      duplicate_rows: duplicates, malformed_line_numbers: malformed,
      definitions: {missing: 'empty or whitespace-only cell; zero is observed', duplicate: 'exact repeated parsed row among well-formed rows'}},
    preview,
    missingTotal: missing.reduce((sum,n) => sum+n,0)
  };
}

export function readWeather(text) {
  const entries = parseCSV(text);
  if (!entries.length) throw Error('Weather sample is empty.');
  const header = entries.shift().cells;
  const indices = ['date','rain_mm','temp_c'].map(name => header.indexOf(name));
  if (indices.some(i => i < 0) || new Set(header).size !== header.length) throw Error('Weather data needs date, rain_mm and temp_c columns.');
  const dates = new Set();
  const data = entries.map(({cells,line}) => {
    if (cells.length !== header.length) throw Error(`Malformed weather row on line ${line}.`);
    const date = cells[indices[0]], parsed = new Date(date+'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date || dates.has(date)) throw Error(`Invalid or duplicate date on line ${line}.`);
    dates.add(date);
    const values = indices.slice(1).map(i => {
      const raw = cells[i].trim(); if (!raw) return null;
      const n = Number(raw); if (!Number.isFinite(n)) throw Error(`Invalid measurement on line ${line}.`); return n;
    });
    if (values[0] !== null && values[0] < 0) throw Error('Rainfall cannot be negative.');
    return {date, rain_mm:values[0],temp_c:values[1]};
  });
  if (!data.length) throw Error('Weather sample has no observations.');
  return data.sort((a,b) => a.date.localeCompare(b.date));
}

export function weatherSummary(data, metric) {
  const values = data.map(row => row[metric]).filter(v => v !== null && Number.isFinite(v));
  const sum = values.reduce((a,b)=>a+b,0);
  return {observed:values.length, missing:data.length-values.length,
    sum:values.length?sum:null, mean:values.length?sum/values.length:null};
}

export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function safeWebURL(value) {
  value = value ?? '';
  if (!String(value).trim()) return '';
  let url;
  try { url = new URL(value); } catch { throw Error('Enter a complete HTTPS project URL, or leave it blank.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use an HTTPS URL without login credentials.');
  return url.href;
}

export function makePortfolio({name,role,title,description,url}) {
  if (![name,role,title,description].every(value=>value != null && String(value).trim())) throw Error('Fill in your name, role, project title and description.');
  const link = safeWebURL(url);
  const values = [name,role,title,description].map(value=>escapeHTML(String(value).trim()));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${values[0]} · Portfolio</title>
<style>body{font:18px/1.7 system-ui,sans-serif;max-width:780px;margin:60px auto;padding:0 24px;color:#17243d;background:#f6f8fc}header{border-bottom:3px solid #5268d8;padding-bottom:24px}h1{font-size:clamp(2.4rem,8vw,4rem);line-height:1.1;letter-spacing:-.05em}article{background:white;border:1px solid #dce2ef;border-radius:16px;padding:28px;margin-top:32px}p{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#334bc1;text-underline-offset:4px}footer{margin:32px 0;font-size:14px;color:#526078}</style></head>
<body><header><p>MY LEARNING PORTFOLIO</p><h1>${values[0]}</h1><p>${values[1]}</p></header><main><article><h2>${values[2]}</h2><p>${values[3]}</p>${link?`<a href="${escapeHTML(link)}" rel="noopener noreferrer" target="_blank">View project</a>`:''}</article></main><footer>Built with the Learn by Doing portfolio starter.</footer></body></html>`;
}

export function normalizeProgress(raw) {
  const result = {};
  for (const id of PROJECT_IDS) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) && raw[id];
    const done = Array.isArray(source?.done) ? [...new Set(source.done.filter(item=>PHASES.includes(item)))] : [];
    result[id] = {done, note:typeof source?.note==='string'?source.note.slice(0,5000):''};
  }
  return result;
}

export function filterProjects(projects, {skill='all',difficulty='all',minutes='all'}={}) {
  return projects.filter(project => (skill==='all'||project.skill===skill) &&
    (difficulty==='all'||project.difficulty===difficulty) &&
    (minutes==='all'||project.minutes<=Number(minutes)));
}

export function projectLog(project, progress) {
  return `# ${project.title} — my project log\n\n` + PHASES.map(phase=>`- [${progress.done.includes(phase)?'x':' '}] ${phase[0].toUpperCase()+phase.slice(1)}`).join('\n') +
    `\n\n## What I tried, learned, and will do next\n\n${progress.note||'Add your reflection here.'}\n`;
}
