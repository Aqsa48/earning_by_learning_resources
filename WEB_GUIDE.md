# Learn by Doing web hub

The hub is a static website backed by this repository. It needs no server database, paid service, account system, or external JavaScript dependency.

## What visitors can do

- Filter three projects by skill, starting level, and first-version time estimate.
- Follow Choose → Plan → Build → Test → Reflect, check off their own progress, and record notes.
- Inspect a CSV locally and download a JSON quality report. The browser accepts UTF-8 comma-separated files up to 2 MiB, 20,000 data rows, and 200 columns. Quoted commas, multiline cells, and doubled quotes are supported. Broken quote syntax and ambiguous headers are rejected.
- Explore synthetic rainfall and temperature observations, download data, and export an SVG chart.
- Preview a small portfolio page and download a standalone HTML file. The preview is sandboxed and does not run scripts.
- Read direct official references and open a GitHub issue to suggest a project or resource.

CSV contents and portfolio text are not uploaded or saved by the app. Project checkboxes and reflection notes are saved under `aqsa-learn-by-doing:v1` in local browser storage when available. They do not sync between browsers or devices. Download the project log before clearing browser data; if storage is unavailable, the app reports it and keeps only the current session's state.

The weather data and starter text are illustrative. No results, employment outcomes, or earnings are promised.

## Run locally

From the repository root with Python 3.10+ and Node.js 22+:

```sh
python tools/build_site.py
python -m http.server 8010 --directory _site
```

Open `http://localhost:8010`. Serve the built folder over HTTP; ES modules and sample-file fetches are not intended for `file://` use. The builder copies only a fixed list of public site files and downloads. Historical documents and unrelated repository content are not included in the website package.

## Check behavior

```sh
node --test web/tests/core.test.mjs
python -m unittest discover -s projects/csv-quality-report -v
python -m unittest discover -s projects/weather-data -v
python -m unittest discover -s tools -v
```

To verify the optional local weather plot, install `projects/weather-data/requirements.txt` in a virtual environment and run its script. No Python package installation is needed for the website or its core tests.

## GitHub Pages deployment

Under **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The **Deploy learning hub** workflow checks behavior, builds `_site`, uploads the Pages artifact, and publishes only after the build job succeeds. The `github-pages` environment must allow deployments from `main`.

The expected standard address is `https://aqsa48.github.io/earning_by_learning_resources/`. The account's existing custom domain may redirect this to `https://aqsabrohi.me/earning_by_learning_resources/`. Use the address returned by a successful deployment. Adding the workflow does not itself enable Pages; that initial repository setting requires an owner or administrator.

The existing **Project checks** workflow also runs the tests on Python 3.10 and 3.13. All asset paths are relative so the site works under the repository path. There are no secrets to configure.

## Add a project or resource

Edit `web/projects.mjs` for guide content and references. A new interactive project also needs its tool, progress ID, and tests. Include prerequisites, sample inputs, expected results, source permissions, and a small first-version scope. Link to the full project under `projects/`.

The seven featured references were checked as direct documentation links on 25 November 2026. This is not a claim that every historical resource in the repository has been reviewed. Keep the reviewed list separate from the historical collection.

`web/LICENSE` covers the new web application. Each runnable starter project has its own license file; third-party linked resources keep their own terms.


## Practice, Python, and portable progress

Each project has two multiple-choice challenges with hints and automatic explanatory feedback. These do not silently mark the learner's project steps complete.

The optional Python playground loads Pyodide 314.0.8 from jsDelivr only when Run Python is selected. It executes the edited sample in a module worker, with Stop execution and a ten-second execution limit after runtime loading. Loading itself has a 90-second timeout. Standard-library experiments are supported; automatic package installation is not provided. The playground does not receive uploaded CSV contents or saved notes. Internet access is needed for the first runtime load. A worker is not a security boundary for arbitrary untrusted code; run code you understand. The other project tools work without loading Python.

Export all progress downloads a versioned JSON file. Import validates the file, waits for explicit Merge progress, unions checked steps, and preserves both sets of notes. Oversized combined notes are rejected with an explanation instead of being truncated. Treat exported reflection notes as your own local data; no account or cross-device server sync is used.

The weather explorer now accepts a UTF-8 CSV with date, rain_mm, and temp_c columns for one station. Dates must be unique YYYY-MM-DD values. Empty measurements stay missing; negative rainfall and nonfinite values are rejected. Charts use actual date spacing, break temperature lines across absent dates, and label observed totals separately from full-period totals. Restore synthetic sample returns to the reference data. All-missing measurements display no numeric total or mean.

The gallery contains labeled maintainer examples until genuine submissions are reviewed. See COMMUNITY_GALLERY.md for the review checklist. Accessibility changes include semantic challenge fieldsets, explicit form labels, status feedback, visible focus, larger control targets, stronger secondary-text colors, and a single-column practice layout on small screens. These changes do not constitute a claim of complete accessibility conformance.
