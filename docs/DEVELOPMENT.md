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
4. Push a tag matching `v<version>`, for example `v1.8.0`.

The tagged-release workflow checks that tag and manifest match, validates the build, runs browser tests and creates a GitHub release containing the install ZIP and checksums. Regular pushes/PRs run read-only validation.

Theme text follows Steam’s interface language. See [localization](LOCALIZATION.md) for catalogs, generated CSS labels and layout tests. English and German documentation is included. A catalogue submission would additionally require reviewing the catalogue's current language and submission requirements; GitHub publication alone is not a catalogue submission.

## Native window styling in 1.7.0

Edit `src/theme/steamwindows.custom.css` for the remaining native windows. The new patch uses the existing desktop UI roots and shared controls, without new JavaScript. `npm test` also runs the window regression fixtures. Their portable selector tokens do not contain account data or a copy of Steam CSS. To additionally test against a locally installed client, set `HYPERSHIFT_NATIVE_CSS` to its `steamui/css` directory. See [window coverage](WINDOW-COVERAGE.md).


## Downloads and toast regression tests in 1.7.1

`downloads.custom.css` is a desktop-only patch loaded after the main library CSS. It separates full artwork from the graph and colors the actual progress fill rather than the label container. Do not replace Steam's inline widths, byte counts or action handlers.

`node tests/downloads.cjs` exercises the native class structure with synthetic data and a vector image marked at all four corners. It checks four viewport sizes, original node identity, progress widths at 0/3/64/100%, controls, nested notification text contrast and unrelated-page isolation. It covers all four current toast template maps. Optional `HYPERSHIFT_NATIVE_CSS` and `HYPERSHIFT_SCREENSHOTS` work as in `tests/windows.cjs`; these remain local fixture tests, not automated use of the real client.

## Download graph and settings chrome regression tests in 1.7.2

The SVG fixture includes Steam's transparent `GraphBarEmpty` history hit areas, graph groups and hover points. Tests assert that hit rectangles stay transparent and retain hover behavior, and that the native paused status tree keeps its 41% fill and readable legend/percentage text. Contrast checks composite translucent backgrounds.

The settings fixture models the native single `TitleBar.title-area` element, original div-based close/min/max controls, reserved content space, scrolling and the special `FakeContainer` update-timing card. Tests retain the original close node and exercise its local handler at 850×722 and 1100×850. These fixtures use synthetic content, not a running Steam session; reload and review the installed theme separately.
