# Changelog


## 1.7.1 — 2026-10-05

- Show the complete active-download artwork without Steam's zoom or fading mask; keep the chart beside the image.
- Separate download/install labels from their 6px progress tracks. Keep Steam's inline fill widths and live values intact.
- Correct dark status text on the light active-download panel, including network/max/disk values and the remaining time.
- Fix inherited light text and reduced text opacity in native notification headers, nested names, game titles, messages and achievement descriptions. Keep native toast animation/timing and actions.
- Add portable download/toast fixtures and tests at four desktop sizes, including 0/3/64/100% fill widths, native action models, four toast templates and scope isolation. Also checked against the installed Steam CSS; live-client review remains separate.

## 1.7.0 — 2026-10-05

- Add native Steam settings and game properties styling: general, updates, betas, installed files, DLC, Workshop, controller, recording, privacy and shortcut customization.
- Style storage, install/uninstall, moves/backups, cloud conflicts, launch options, non-Steam game selection, server/player browsers, media controls, sharing, system reports, licenses and additional friend/group dialogs.
- Add black settings navigation, acid-yellow selection, readable lavender fields, custom toggle states and consistent dialog/window controls. Long navigation labels can wrap.
- Cover 52 native root types and five paged-navigation variants discovered in the installed client, using a scoped wildcard window patch for localized popup titles.
- Preserve native actions, row geometry, previews and storage-category colors; no new JavaScript is injected for these windows.
- Verify representative windows at three sizes with original Steam CSS and portable fixtures; check contrast, controls and library compatibility.

See [window coverage and test limitations](docs/WINDOW-COVERAGE.md).

## 1.6.4 — 2026-10-04

- First portable public package for `pandalici0/HYPERSHIFT`.
- Resolve library names and image identities from the current account's Steam store at runtime. Remove embedded development-account name/hash indexes and local hero-cache paths.
- Resolve hero art through Steam's existing `appDetailsStore`, including native custom-art URLs and image fallbacks.
- Add ready-built files, editable templates, a dependency-free Python builder, optional Windows installer with backups, bilingual documentation, previews, MIT code license and asset notices.
- Add reproducible release ZIPs with SHA256 checksums and GitHub build/release workflows.

The established appearance is retained. The runtime portability changes are verified in local browser fixtures; the installed 1.6.3 theme remains the last user-confirmed live build.

## 1.6.3 — 2026-10-04

- Restyle the native Steam menu and submenus in black, lavender and acid yellow.
- Preserve keyboard access, disabled states and original menu actions.

## 1.6.2 — 2026-10-04

- Remove the small edition caption beside HYPERSHIFT and the login's Player Access caption.
- Animate the header menu's expansion, retain it while focused or a submenu is open, and respect reduced-motion settings.
- Set the author to pandalici0.

## 1.6.1 — 2026-10-04

- Restore visible game statistics over Steam's backdrop layers.
- Improve achievement-card title/description contrast and status inputs.
- Center Big Picture and native window controls across desktop layouts.

## 1.6.0 — 2026-10-04

- Redesign native game details with a prominent play action, separate statistics, tabs and activity panels.

## 1.5.x — 2026-10-04

- Add Millennium settings, dialogs, notifications and desktop overlay styling.
- Improve native game-detail readability.

## 1.4.x — 2026-10-04

- Style desktop login, Steam Guard and account selection.
- Improve native library text contrast and restore back/forward navigation.

## 1.3.x — 2026-10-04

- Show the complete visible library directly on the home page, including games not installed locally.
- Refine friends/chat layouts, download text and icons, native sidebar controls and window buttons.

## 1.0–1.2 — 2026-10-04

- Introduce the HYPERSHIFT library design and retain native download, friend and game actions.
- Restrict displayed games to the current Steam library and improve downloads/chat contrast.
