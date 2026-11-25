const expected = (rows, malformed) => ({
  rows, valid_rows: 4, columns: ['station', 'date', 'rain_mm'],
  missing_cells: {station: 0, date: 0, rain_mm: 1},
  duplicate_rows: 1, malformed_line_numbers: malformed
});

export const CSV_EXERCISES = {
  sample: {
    title: 'Original rainfall sample', file: 'downloads/csv-sample.csv',
    expected: expected(4, []),
    explanation: 'The header is not a data row. All four data rows have three cells. The empty rain_mm cell is missing; both measured zeros are present. Alpine-B appears twice with identical cells, so only the repeat counts as a duplicate.'
  },
  edge: {
    title: 'Quoted comma and malformed row', file: 'downloads/csv-edge-cases.csv',
    expected: expected(5, [6]),
    explanation: 'The quoted station "Alpine, A" is one cell. The whitespace-only rainfall cell is missing. The repeated Alpine-B row adds one duplicate. Physical line 6 has only two cells: count it in the five data rows, exclude it from the four valid rows, and list it as malformed. Its absent third cell does not add to the missing-cell count.'
  }
};

// Compare independently stated expectations, not a second run of the checker.
// File names, definitions, and extra metadata can vary between implementations.
export function checkCSVReport(text, exerciseId) {
  const exercise = CSV_EXERCISES[exerciseId];
  if (!exercise) throw Error('Choose a known exercise.');
  if (text.length > 100000) throw Error('Paste a JSON report smaller than 100 KB.');
  let report;
  try { report = JSON.parse(text); } catch { throw Error('Paste the JSON report itself, without Markdown fences or terminal commands.'); }
  if (!report || typeof report !== 'object' || Array.isArray(report)) throw Error('The report must be a JSON object.');
  const target = exercise.expected;
  const checks = [];
  const add = (name, actual, wanted, hint) => checks.push({name,
    passed: JSON.stringify(actual) === JSON.stringify(wanted),
    feedback: `${name}: expected ${JSON.stringify(wanted)}; received ${JSON.stringify(actual) ?? 'a missing field'}. ${hint}`});
  add('Data rows', report.rows, target.rows, 'Exclude the header; include rows with the wrong number of cells.');
  add('Well-formed rows', report.valid_rows, target.valid_rows, 'Count only rows with the same number of cells as the header.');
  add('Columns', report.columns, target.columns, 'Keep the header names in their original order.');
  for (const name of target.columns) {
    add(`Missing ${name} cells`, report.missing_cells?.[name], target.missing_cells[name],
      'Count empty or whitespace-only cells in well-formed rows. Zero is observed; NA is text in this version.');
  }
  add('Duplicate rows', report.duplicate_rows, target.duplicate_rows, 'Count exact repeated parsed rows after the first occurrence; exclude malformed rows.');
  add('Malformed starting lines', report.malformed_line_numbers, target.malformed_line_numbers,
    'Use physical line numbers, with the header on line 1. A quoted comma stays inside one cell.');
  return {passed: checks.every(check => check.passed), checks};
}

export function initializeCSVLesson({download}) {
  const $ = id => document.getElementById(id);
  let currentReport = null;
  function resetFeedback() {
    $('csv-report-feedback').replaceChildren();
    $('csv-report-status').textContent = 'Choose the matching exercise, then check your report.';
  }
  function showExercise() {
    const exercise = CSV_EXERCISES[$('csv-exercise').value];
    $('csv-exercise-download').href = exercise.file;
    $('csv-expected').textContent = JSON.stringify(exercise.expected, null, 2);
    $('csv-walkthrough').textContent = exercise.explanation;
    $('csv-solution').open = false;
    resetFeedback();
  }
  $('csv-exercise').addEventListener('change', showExercise);
  $('csv-report-input').addEventListener('input', resetFeedback);
  $('csv-use-report').addEventListener('click', () => {
    if (!currentReport) return;
    $('csv-report-input').value = JSON.stringify(currentReport, null, 2);
    resetFeedback();
    $('csv-report-status').textContent = 'Current checker report copied. Select its matching exercise before checking.';
  });
  $('csv-report-form').addEventListener('submit', event => {
    event.preventDefault();
    $('csv-report-feedback').replaceChildren();
    try {
      const result = checkCSVReport($('csv-report-input').value, $('csv-exercise').value);
      $('csv-report-status').textContent = result.passed
        ? 'All 8 checks passed for this exercise. Explain why the counts make sense, then record your result in your project notes.'
        : `${result.checks.filter(check => check.passed).length} of 8 checks passed. Review the differences below, update your code or report, and try again.`;
      for (const check of result.checks) {
        const item = document.createElement('li');
        item.textContent = check.passed ? `Passed: ${check.name}.` : check.feedback;
        $('csv-report-feedback').append(item);
      }
    } catch (error) { $('csv-report-status').textContent = error.message; }
  });
  $('csv-expected-download').addEventListener('click', () => {
    const id = $('csv-exercise').value;
    download(JSON.stringify(CSV_EXERCISES[id].expected, null, 2) + '\n', `csv-${id}-expected.json`, 'application/json');
  });
  showExercise();
  return {setCurrentReport(report) {currentReport = report; $('csv-use-report').disabled = !report;}};
}
