import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {inspectCSV} from '../core.mjs';
import {CSV_EXERCISES, checkCSVReport} from '../csv-lesson.mjs';

const input = name => readFileSync(new URL(`../../projects/csv-quality-report/${name}`, import.meta.url), 'utf8');
const sampleReport = () => inspectCSV(input('sample.csv')).report;

test('Documented original and edge exercise expectations match the actual CSV fixtures', () => {
  for (const [id, file] of [['sample', 'sample.csv'], ['edge', 'edge-cases.csv']]) {
    const result = checkCSVReport(JSON.stringify(inspectCSV(input(file)).report), id);
    assert.equal(result.passed, true, id);
    assert.equal(result.checks.length, 8);
  }
  assert.equal(inspectCSV(input('edge-cases.csv')).preview[0][0], 'Alpine, A');
});

test('Each common counting error receives a specific failing check', () => {
  const errors = [
    ['Data rows', report => report.rows++],
    ['Well-formed rows', report => report.valid_rows--],
    ['Columns', report => report.columns.reverse()],
    ['Missing station cells', report => report.missing_cells.station++],
    ['Missing date cells', report => report.missing_cells.date++],
    ['Missing rain_mm cells', report => report.missing_cells.rain_mm = 3],
    ['Duplicate rows', report => report.duplicate_rows = 2],
    ['Malformed starting lines', report => report.malformed_line_numbers = [5]]
  ];
  for (const [name, mutate] of errors) {
    const report = sampleReport(); mutate(report);
    const result = checkCSVReport(JSON.stringify(report), 'sample');
    assert.equal(result.passed, false, name);
    assert.deepEqual(result.checks.filter(check => !check.passed).map(check => check.name), [name]);
  }
});

test('Wrong exercise, missing fields and numeric strings cannot pass', () => {
  assert.equal(checkCSVReport(JSON.stringify(sampleReport()), 'edge').passed, false);
  assert.equal(checkCSVReport('{}', 'sample').checks.filter(check => check.passed).length, 0);
  const report = sampleReport(); report.rows = '4';
  assert.equal(checkCSVReport(JSON.stringify(report), 'sample').passed, false);
});

test('Reordered object keys and optional metadata do not cause false failures', () => {
  const report = sampleReport();
  report.file = 'my-input.csv'; report.definitions = {missing: 'my explanation'};
  report.missing_cells = {rain_mm: 1, date: 0, station: 0};
  assert.equal(checkCSVReport(JSON.stringify(report), 'sample').passed, true);
  assert.equal(checkCSVReport(JSON.stringify(CSV_EXERCISES.sample.expected), 'sample').passed, true);
});

test('Invalid, oversized and non-object reports give actionable errors', () => {
  for (const text of ['', '```json\n{}\n```', '{invalid']) assert.throws(() => checkCSVReport(text, 'sample'), /JSON report/);
  for (const text of ['null', '[]', '4', '"report"']) assert.throws(() => checkCSVReport(text, 'sample'), /JSON object/);
  assert.throws(() => checkCSVReport(' '.repeat(100001), 'sample'), /100 KB/);
  assert.throws(() => checkCSVReport('{}', 'unknown'), /known exercise/);
});
