# Submit a project to the gallery

The public gallery currently contains maintainer reference examples with synthetic data or editable starter content. They are not testimonials or learner submissions. No external community entry is displayed until it has been reviewed.

To propose an entry, open a project-idea issue or a pull request updating `web/gallery.json`. Include:

- A public HTTPS source link and a short description of who the project helps.
- A sample input you are permitted to share and the expected output.
- Reproduction steps and evidence of the checks you ran.
- The code/data license and permission to display the author's chosen attribution.
- A specific limitation or lesson learned. Do not promise employment or income.

A maintainer should reproduce the example, verify source and attribution permissions, check links, and approve the pull request before an entry is described as reviewed. Do not add private datasets, credentials, personal information, invented authors, or unverified claims. Keep reference examples clearly labeled when no community submissions have been accepted.

Gallery entries use `kind`, `title`, `result`, `verification`, and `source` fields. The website renders text as text and accepts HTTPS source URLs only. Browser tools and Python execution do not submit entries automatically.
