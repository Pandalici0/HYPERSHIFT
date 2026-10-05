# Native window coverage · Fensterabdeckung

Version 1.7.0 adds `steamwindows.custom.css`, loaded for every window title and scoped to existing native Steam roots. It complements the previously styled library/detail pages, friends/chat, login, Millennium settings, desktop notifications and overlay.

The installed client was inspected for remaining window types and shared controls. The new patch covers **52 native root types** and **five paged-navigation variants**. These are technical UI components: some are embedded sections or variants of the same window. This number does not mean that 52 separate live windows were opened.

| Bereich / Area | Covered native surfaces |
| --- | --- |
| Spieleigenschaften | General, updates, betas, installed files, DLC, Workshop, controller, recording, privacy and shortcut customization; tabs appear only where the game/client provides them. |
| Steam-Einstellungen | Shared navigation, headings, field cards, labels, descriptions, inputs, dropdowns, toggles, sliders and buttons used by account, interface, downloads, cloud, family, controller, recording and other native settings pages. |
| Speicher und Installation | Storage/library folders, game rows, selection, usage headings, drive menus, install/progress, uninstall, move and backup dialogs. |
| Spielstart und Cloud | Launch options, game-launch/streaming dialogs, borrow/preferred-library dialogs, cloud conflicts and outdated-client prompts. |
| Server und Spieler | Server browser tabs/filters/results, game information, player lists and network-information panels. |
| Medien | Screenshot/recording panels, metadata, sharing/caption controls, recording quality/duration and clip-sharing prompts. Image/video preview surfaces retain dark backgrounds. |
| Weitere Dialoge | Add a non-Steam game, about Steam, update checks, licenses/EULAs, system reports, compatibility filters, reviews, music, broadcasts and generic confirmations. |
| Freunde und Gruppen | Add-friend/friend-code areas, invitations, Remote Play links, group members and voice/text channel dialogs; existing social styling remains in use. |

Actions remain Steam actions. No additional JavaScript is injected for these windows. Styling does not select a cloud save, change launch options, install/uninstall a game, submit a review, share media or send a message.

## Verification

- Properties/settings fixtures at 842×720, 650×740 and 500×800, using portable baseline CSS and installed Steam CSS.
- At least 4.5:1 contrast for sampled headings, labels, descriptions, usage values, dark table headers, media metadata and report text.
- Navigation, toggles including native pseudo-elements, dropdowns, inputs, primary/disabled actions and all three window-control hit targets.
- Selected server/storage/cloud rows and unchanged 40px example virtual-row geometry.
- Library regression tests with the new stylesheet loaded alongside the main theme.
- Automated tests use synthetic fixtures. Public previews use live Steam captures, with contact names and third-party avatars visibly masked.

These checks use local DOM fixtures and selectors from the installed client. They are not live tests of every account, hardware, login, recording or game state. Reopen existing popup windows after reloading the theme, then report any remaining unstyled area with a screenshot.

## Grenzen / Limits

Millennium styles supported Steam web-based surfaces. Operating-system file pickers, permission prompts and other native Windows dialogs are outside this CSS layer. Embedded store/community pages, external browser pages and document/browser contents keep their own page styling; surrounding Steam frames and applicable controls receive theme styling. New or renamed roots introduced by future Steam updates may need follow-up selectors.
