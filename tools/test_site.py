from html.parser import HTMLParser
from pathlib import Path
import re
import tempfile
import unittest
from build_site import build, ROOT, WEB_FILES, DOWNLOADS


class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.iframe_sandbox = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for name in ['href', 'src']:
            if attrs.get(name):
                self.links.append(attrs[name])
        if tag == 'iframe':
            self.iframe_sandbox.append(attrs.get('sandbox'))


class SiteTests(unittest.TestCase):
    def test_public_package_has_only_intended_files_and_working_local_links(self):
        with tempfile.TemporaryDirectory() as folder:
            output = build(Path(folder)/'site')
            parser = Assets()
            parser.feed((output/'index.html').read_text(encoding='utf-8'))
            self.assertEqual(len(parser.ids),len(set(parser.ids)))
            self.assertEqual(parser.iframe_sandbox,[''])
            references = set(re.findall(r"\$\('([^']+)'\)", '\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'web').glob('*.mjs'))))
            self.assertTrue(references.issubset(set(parser.ids)), references-set(parser.ids))
            for url in parser.links:
                if url.startswith(('https://', '#')) or url == './':
                    continue
                self.assertTrue((output/url).is_file(),url)
            actual = {p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()}
            expected = set(WEB_FILES)|{'downloads/'+name for name in DOWNLOADS}|{'.nojekyll'}
            self.assertEqual(actual,expected)
            self.assertNotIn('tests/core.test.mjs',actual)

    def test_output_cannot_replace_source_directory(self):
        with self.assertRaises(ValueError):
            build(ROOT/'web')


if __name__ == '__main__':
    unittest.main()
