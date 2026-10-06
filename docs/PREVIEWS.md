# HYPERSHIFT preview kit

By **pandalici0**, based on HYPERSHIFT **1.8.0**.

The gallery uses actual screenshots from the running Windows Steam client with installed HYPERSHIFT 1.8.0, captured in English on **6 October 2026**. Contact names and third-party avatars are visibly masked, including the clipped activity contact on the game detail page. Other UI pixels retain the original layout. The chat conversation and download queue were empty at capture time; no messages, contacts, controls or transfer values were invented. The side-by-side social view combines the two real windows on a plain background.

Promotional frames surround these same captures. Game imagery and trademarks remain excluded from the MIT code license; see [NOTICE](../NOTICE.md).

The screenshots are static English previews; the installed theme follows Steam's interface language. [Capture metadata](images/captures.json) records the original window sizes, capture state and privacy masks.

## Promotional images

| File | Pixels | Use |
| --- | --- | --- |
| [01-cover](images/promo/01-cover.png) | 1920 × 1080 | README banner, release announcement |
| [02-library](images/promo/02-library.png) | 1920 × 1080 | Library showcase |
| [03-game-details](images/promo/03-game-details.png) | 1920 × 1080 | Play button, statistics and achievements |
| [04-friends-chat](images/promo/04-friends-chat.png) | 1920 × 1080 | Friends, chat and voice controls |
| [05-downloads](images/promo/05-downloads.png) | 1920 × 1080 | Transfer statistics and empty queue |
| [06-settings](images/promo/06-settings.png) | 1920 × 1080 | Actual Steam download settings |
| [github-social-1280x640](images/promo/github-social-1280x640.png) | 1280 × 640 | Repository social preview |
| [social-card-1200x630](images/promo/social-card-1200x630.png) | 1200 × 630 | Link preview / social post |

Each image has a PNG original and a JPG version with the same name. Use JPG for lightweight README embeds and PNG when preserving fine UI text matters.

![Preview collection](images/promo/00-preview-sheet.png)

## Unframed UI views

- [Library](images/library.png)
- [Game details](images/game-details.png)
- [Friends and chat](images/social.png), plus separate [friends](images/friends.png) and [chat](images/chat.png) views
- [Downloads](images/downloads.png)
- [Steam settings](images/settings.png)

## Rebuild the promotional layouts

The current captures are the inputs. The compositor uses HTML/CSS and Playwright, without remote assets or access to Steam. It checks the capture version against `skin.json` so an older gallery cannot silently be labeled as a newer theme.

```sh
npm install
npx playwright install chromium
node tools/render-previews.cjs
```

On Windows with Edge installed, set `HYPERSHIFT_BROWSER_CHANNEL=msedge`. The artwork uses local Impact/Arial fonts; font substitution on other systems can change typography.

Deutsch: Für die README `01-cover.jpg` verwenden. Die fünf Showcase-Motive zeigen die Bereiche im Detail. `github-social-1280x640.png` ist für die Repository-Linkvorschau vorbereitet. PNG und JPG sowie die reinen UI-Bilder sind im Paket enthalten. Die UI-Bilder stammen direkt aus Steam; Kontaktnamen und fremde Avatare sind abgedeckt. Der leere Chat entspricht dem tatsächlichen Aufnahmezustand.
