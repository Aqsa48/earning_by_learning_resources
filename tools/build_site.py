"""Prepare only public static files and project downloads for GitHub Pages."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
WEB_FILES = ['index.html', 'style.css', 'app.mjs', 'core.mjs', 'projects.mjs', 'favicon.svg']
DOWNLOADS = {
    'csv-report.py': 'projects/csv-quality-report/report.py',
    'csv-sample.csv': 'projects/csv-quality-report/sample.csv',
    'weather-plot.py': 'projects/weather-data/weather_plot.py',
    'weather-sample.csv': 'projects/weather-data/sample.csv',
    'portfolio-starter.html': 'projects/portfolio-page/index.html',
    'project-log.md': 'PROJECT_LOG.md',
    'LICENSE': 'web/LICENSE',
}


def build(output):
    output = Path(output).resolve()
    # Never use an existing source directory as a publishing destination.
    if output == ROOT or output in [ROOT/'web', ROOT/'projects', ROOT/'tools']:
        raise ValueError('Choose a separate output directory such as _site')
    output.mkdir(parents=True, exist_ok=True)
    (output/'downloads').mkdir(exist_ok=True)
    for name in WEB_FILES:
        shutil.copyfile(ROOT/'web'/name, output/name)
    for name, source in DOWNLOADS.items():
        shutil.copyfile(ROOT/source, output/'downloads'/name)
    (output/'.nojekyll').write_text('', encoding='utf-8')
    print(f'Prepared {len(WEB_FILES)+len(DOWNLOADS)+1} public files in {output}')
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT/'_site')
    args = parser.parse_args()
    build(args.output)
