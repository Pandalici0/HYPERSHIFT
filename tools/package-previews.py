"""Package the public preview gallery; no Steam access or private captures."""
from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'skin.json').read_text(encoding='utf-8'))['version']
images = root / 'docs/images'
capture = json.loads((images / 'captures.json').read_text(encoding='utf-8'))
assert version in capture.get('compatibleThemeVersions', [capture['themeVersion']]), 'Preview captures not approved for this theme version'
dist = root / 'dist'
dist.mkdir(exist_ok=True)
target = dist / f'HYPERSHIFT-Preview-Kit-{version}.zip'
guide = (root / 'docs/PREVIEWS.md').read_text(encoding='utf-8').replace('(../NOTICE.md)', '(NOTICE.md)')
entries = {'README.md': guide.encode('utf-8'), 'NOTICE.md': (root / 'NOTICE.md').read_bytes()}
for p in images.rglob('*'):
    if p.is_file() and p.suffix in {'.png', '.jpg', '.json'}:
        entries['images/' + p.relative_to(images).as_posix()] = p.read_bytes()
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name, data in sorted(entries.items()):
        info = zipfile.ZipInfo('HYPERSHIFT-Preview-Kit/' + name, (2026, 10, 6, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data)
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
print(f'Preview package: {target.name} ({target.stat().st_size:,} bytes)')
