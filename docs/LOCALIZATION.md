# Language support

HYPERSHIFT 1.8.0 follows Steam's configured interface language. The native Steam setting takes priority, then the language on Steam's document root. Unknown languages fall back to English. The OS/browser language does not override Steam.

All 30 selectable Steam interface languages have complete catalogs. Arabic is included as an optional catalog with right-to-left text support; Steam does not currently offer Arabic as a client interface language. See [Valve's language reference](https://partner.steamgames.com/doc/store/localization/languages?l=english).

English, German, French, Italian, Spanish (Spain and Latin America), Portuguese (Portugal and Brazil), Dutch, Danish, Swedish, Norwegian, Finnish, Polish, Czech, Hungarian, Romanian, Bulgarian, Greek, Russian, Ukrainian, Turkish, Simplified and Traditional Chinese, Japanese, Korean, Thai, Vietnamese, Indonesian and Malay are included.

## Localized surfaces

- Library navigation, searches, placeholders, accessible labels, history tooltips and action menus.
- Play/view-game buttons, game headlines, genre tags, empty/loading states and poster text.
- Detail overview button, activity placeholder and statistics-panel heading. Steam's original links, statistics and achievement names keep their native translations.
- Download/friends footer headings, login banners and login labels, including CSS-only login windows.
- Millennium's HYPERSHIFT configuration labels/descriptions. Existing option identifiers and stored selections are retained.

German lettering baked into the original concept atlas is covered by opaque localized caption elements at runtime. The Cyberpunk headline uses live text instead of the raster headline. This avoids a separate image per language. Game names/logos and the HYPERSHIFT wordmark remain brand artwork. Artwork supplied by Steam retains its own language/version.

## Editing and verification

Catalogs are UTF-8 JSON in `locales/<Steam language code>.json`. Every catalog has the same keys. Common interface labels and genres follow Steam's translations; promotional text is translated separately. See [notices](../NOTICE.md).

The portable build embeds the catalogs and generates `localization.custom.css`. No translation service, credentials, downloads or account inventory are needed at runtime or during a rebuild.

```sh
python tools/build.py
python tools/build.py --check --release
node tests/localization.cjs
```

Tests cover all catalogs across three library viewport sizes, live switching with selection/search retained, native actions, configuration identifiers, region aliases, detail labels, English fallback and CSS-only login. Longer headlines/buttons fit the available space; non-Latin text uses suitable font fallbacks. Translations have automated completeness/layout checks; they have not all been independently reviewed by native speakers or exercised in live Steam.

Public gallery images are authentic English Steam captures of 1.8.0 from 6 October 2026. Static screenshots do not change language with Steam and are not presented as captures of every locale.
