# Development

## Layout

```text
skin.json                  Millennium manifest and theme conditions
*.css / *.js               Generated, ready-to-install runtime files
src/theme/                 Editable CSS/JS templates
assets/hypershift-concept.png  Original artwork atlas
tools/build.py             Portable builder, validator and release ZIP creator
Install.ps1               Optional Windows installer with backup and hash check
tests/                    Account-independent browser regression tests
docs/                     Documentation and UI-fixture previews
.github/workflows/        Build validation and tagged releases
```

The templates retain generated native selectors so no copy of Steam's client source or selector-extraction tooling is needed. Edit `src/theme/libraryroot.custom.css` for the main surface and game details. `libraryroot.custom.js` contains library discovery, native-action integration and detail-layout hooks. Friends, login, settings, notifications and overlay have separate files. Asset embeddings use the `__HYPERSHIFT_ATLAS__` marker, replaced by the builder.

The runtime queries existing Steam stores (`appStore`, `collectionStore`, `appDetailsStore`) and DOM controls. It does not scan the filesystem, persist an inventory, query account credentials or send user data to an external service. Native image URLs may cause Steam's normal artwork requests. On missing stores, the native library remains available. Game IDs are checked against the current visible inventory before creating a Steam game-detail link. Original game/detail controls retain their DOM parents and Steam handlers.

## Build

Python 3.10+ is enough; no pip packages are required:

```sh
python tools/build.py
python tools/build.py --check --release
```

`--check` compares generated runtime bytes to templates. `--release` creates `dist/HYPERSHIFT-Millennium-<version>.zip` and `dist/SHA256SUMS.txt`. The ZIP is reproducible for the same source contents and contains one `hypershift` directory, without source files, test fixtures or development caches.

## Test

JavaScript syntax:

```sh
node --check libraryroot.custom.js
```

Browser regressions use Node 20+ and Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

These tests run against a minimal synthetic DOM and mocked stores. They cover account-independent name/hash discovery, hidden/unowned-game filtering, initialization after page load, dynamic inventory changes, native play actions, hero-image resolution/fallbacks and clean reinjection/removal. They do not log into Steam or send chat messages.

The original 1.6.3 development also exercised library geometry at eight desktop sizes, native downloads/friends controls, menu animation and keyboard states, details statistics/achievement contrast, login layouts, settings, notification and overlay fixtures. This repository does not redistribute the Steam CSS bundles used for those local checks. Fixture tests cannot replace visual checks in the running client. The 1.6.4 portability changes have not yet received the same live-client confirmation as 1.6.3.

## Release

1. Update the version in `skin.json` and the changelog.
2. Rebuild and run checks. Update documentation/download names and previews if appropriate.
3. Commit the generated runtime files with their templates.
4. Push a tag matching `v<version>`, for example `v1.6.4`.

The tagged-release workflow checks that tag and manifest match, validates the build, runs browser tests and creates a GitHub release containing the install ZIP and checksums. Regular pushes/PRs run read-only validation.

Theme-added text is currently German. English documentation is included. A catalogue submission would additionally require reviewing the catalogue's current language and submission requirements; GitHub publication alone is not a catalogue submission.
