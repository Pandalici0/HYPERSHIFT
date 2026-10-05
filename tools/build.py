#!/usr/bin/env python3
"""Build and package HYPERSHIFT. Python 3.10+, standard library only."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MARKER = '__HYPERSHIFT_ATLAS__'


def manifest():
    return json.loads((ROOT / 'skin.json').read_text(encoding='utf-8'))


def expected_files():
    atlas = base64.b64encode((ROOT / 'assets/hypershift-concept.png').read_bytes()).decode()
    catalogs = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in sorted((ROOT / 'locales').glob('*.json'))}
    keys = set(catalogs['english']['strings'])
    if len(catalogs) != 31 or any(set(c['strings']) != keys or not all(isinstance(v,str) and v.strip() for v in c['strings'].values()) for c in catalogs.values()):
        raise ValueError('Incomplete language catalogs')
    language_json = json.dumps(catalogs,ensure_ascii=False,separators=(',',':'))
    files = {p.name: p.read_text(encoding='utf-8').replace(MARKER, atlas).replace('__HYPERSHIFT_LOCALES__',language_json).replace('__HYPERSHIFT_VERSION__',manifest()['version'])
             for p in sorted((ROOT / 'src/theme').iterdir()) if p.suffix in {'.css', '.js'}}
    files['libraryroot.custom.js'] = files['localization.custom.js'] + '\n' + files['libraryroot.custom.js']
    def css_vars(c):
        strings=c['strings'];values={k:strings[k] for k in ['downloads','friends','yourGame','nextLevel','login']}
        values['loginBanner']=strings['nextLevel']+'\n'+strings['posterOwn']
        return ';'.join('--hs-l10n-'+k+':'+json.dumps(v,ensure_ascii=False).replace('\\n','\\A ') for k,v in values.items())+';'
    css='/* Generated from locales/*.json. Also works in CSS-only login windows. */\n:root{'+css_vars(catalogs['english'])+'}\n'
    for name,c in catalogs.items():
        css += ':root:lang('+c['locale']+'),:root:lang('+name+'),:root[data-hs-locale="'+c['locale']+'"]{'+css_vars(c)+'}\n'
    # Region aliases precede the more-specific canonical overrides above.
    for alias,name in {'zh':'schinese','zh-Hant':'tchinese','zh-HK':'tchinese','zh-Hans':'schinese','nb':'norwegian','nn':'norwegian','es-MX':'latam'}.items():
        css += ':root:lang('+alias+'){'+css_vars(catalogs[name])+'}\n'
    # Repeat canonical Chinese selectors so zh cannot override zh-TW.
    for name in ['schinese','tchinese']:
        c=catalogs[name];css+=':root:lang('+c['locale']+'),:root[data-hs-locale="'+c['locale']+'"]{'+css_vars(c)+'}\n'
    files['localization.custom.css']=css
    return {name:content.encode('utf-8') for name,content in files.items()}


def build(check=False):
    expected = expected_files()
    for name, content in expected.items():
        target = ROOT / name
        if check:
            if not target.is_file() or target.read_bytes() != content:
                raise ValueError(f'Generated file differs from source: {name}. Run python tools/build.py')
        else:
            target.write_bytes(content)
    validate()
    return expected


def validate():
    skin = manifest()
    if skin['author'] != 'pandalici0' or skin['name'] != 'HYPERSHIFT':
        raise ValueError('Unexpected theme identity')
    if not re.fullmatch(r'\d+\.\d+\.\d+', skin['version']):
        raise ValueError('Version must use major.minor.patch')
    paths = [skin['Steam-WebKit']]
    for patch in skin['Patches']:
        re.compile(patch['MatchRegexString'])
        paths.extend(patch[k] for k in ('TargetCss', 'TargetJs') if k in patch)
    for condition in skin['Conditions'].values():
        if condition['default'] not in condition['values']:
            raise ValueError('Invalid default condition')
        for value in condition['values'].values():
            paths.extend(target['src'] for target in value.values())
    for name in paths:
        if Path(name).is_absolute() or '..' in Path(name).parts or not (ROOT / name).is_file():
            raise ValueError(f'Missing/invalid theme path: {name}')
    for p in (ROOT / 'src/theme').iterdir():
        if p.suffix not in {'.css', '.js'}:
            continue
        text = p.read_text(encoding='utf-8')
        if re.search(r'C:[/\\]|file:///|const (?:META|HEROES)=|@import\s', text):
            raise ValueError(f'Nonportable runtime source: {p.name}')
    script = (ROOT / 'libraryroot.custom.js').read_text(encoding='utf-8')
    if MARKER in script:
        raise ValueError('Unresolved asset marker')


def release():
    generated = build(check=True)
    version = manifest()['version']
    dist = ROOT / 'dist'
    dist.mkdir(exist_ok=True)
    destination = dist / f'HYPERSHIFT-Millennium-{version}.zip'
    files = [ROOT / name for name in generated]
    files += [ROOT / name for name in ('skin.json', 'README.md', 'README.de.md', 'LICENSE',
              'NOTICE.md', 'CHANGELOG.md', 'Install.ps1', 'assets/hypershift-concept.png')]
    files += [p for p in (ROOT / 'docs').rglob('*') if p.is_file()]
    files += [p for p in (ROOT / 'locales').glob('*.json')]
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for p in sorted(files):
            info = zipfile.ZipInfo('hypershift/' + p.relative_to(ROOT).as_posix(), (2026, 10, 4, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, p.read_bytes())
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError('Invalid release ZIP')
    checksum = hashlib.sha256(destination.read_bytes()).hexdigest()
    (dist / 'SHA256SUMS.txt').write_text(f'{checksum}  {destination.name}\n', encoding='utf-8')
    print(f'Release: {destination.name} ({destination.stat().st_size:,} bytes)')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify tracked runtime files match sources')
    parser.add_argument('--release', action='store_true', help='Create a reproducible install ZIP and SHA256 checksum')
    args = parser.parse_args()
    build(check=args.check)
    if args.release:
        release()
    print('HYPERSHIFT build and manifest validation passed.')
