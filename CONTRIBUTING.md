# Contributing

Start with a small change that someone can run or verify. Report the problem, show expected and actual behavior, and include a minimal public or synthetic example. Do not include credentials, personal data, or restricted research inputs.

## Local checks

```sh
python -m unittest discover -s projects/csv-quality-report -v
```

Use a virtual environment with Python 3.10 or later. Explain the checks you ran in your pull request. For new behavior, add a focused test with an explicit expected result. Keep unrelated changes in a separate pull request.

## Small tasks

- Add configurable missing-value tokens with tests for literal NA strings.
- Check a historical resource and replace its shortened link with a direct source URL.
- Build a small project example with synthetic input and expected output.

Discuss larger changes in an issue before implementing them. Respect contributors, describe disagreements in terms of the code or evidence, and credit sources and contributors. Maintainer responses depend on availability; no response time is promised.

## Web hub and new projects

Run the JavaScript and site-package checks before changing a browser tool:

```sh
node --test web/tests/core.test.mjs
python -m unittest discover -s projects/weather-data -v
python -m unittest discover -s tools -v
python tools/build_site.py
```

Use [project ideas](https://github.com/Aqsa48/earning_by_learning_resources/issues/new?template=project_idea.yml) and [resource suggestions](https://github.com/Aqsa48/earning_by_learning_resources/issues/new?template=resource_suggestion.yml) for scoped proposals. Explain the learner's goal, prerequisites, expected result, and what you tested. Synthetic fixtures are preferred. Documentation in [WEB_GUIDE.md](WEB_GUIDE.md) describes the static build and browser-storage behavior.
