# Installation · Installation und Aktualisierung

## Deutsch

Voraussetzung sind Steam für Windows und installiertes [Millennium](https://steambrew.app/). Das Theme verwendet JavaScript für Bibliothek und Spielseiten; erlaube es in den Millennium-Design-Einstellungen.

### Manuell installieren

1. Das HYPERSHIFT-Millennium-ZIP aus den [Releases](https://github.com/pandalici0/HYPERSHIFT/releases) herunterladen.
2. ZIP entpacken und den darin enthaltenen Ordner `hypershift` in `<Steam-Ordner>\millennium\themes\` kopieren.
3. Prüfen: `skin.json` liegt direkt unter `<Steam-Ordner>\millennium\themes\hypershift\skin.json`, ohne einen zusätzlichen verschachtelten Ordner.
4. In Millennium unter **Designs** HYPERSHIFT auswählen und Theme-JavaScript aktivieren.
5. Theme neu laden. Freunde-, Chat-, Einstellungen- und Overlayfenster bei Bedarf neu öffnen. Falls ein Fenster die alten Styles behält, beim nächsten regulären Steam-/Spielstart erneut prüfen.

Bei einer Standardinstallation lautet das Ziel `C:\Program Files (x86)\Steam\millennium\themes\hypershift`.

### Optionaler Installer

`Install.ps1` liegt im entpackten `hypershift`-Ordner und kann in PowerShell gestartet werden:

```powershell
.\Install.ps1
# Bei einem anderen Installationspfad:
.\Install.ps1 -SteamPath 'D:\Steam'
# Erst anzeigen, welche Dateien kopiert werden:
.\Install.ps1 -SteamPath 'D:\Steam' -WhatIf
```

Bei fehlenden Schreibrechten dieselbe PowerShell-Aktion als Administrator ausführen. Der Installer beendet keine Prozesse, lädt nichts herunter und ändert keine Steam-Einstellungen. Er sichert einen bestehenden HYPERSHIFT-Ordner unter `<Steam-Ordner>\millennium\theme-backups\`, kopiert nur die Installationsdateien und vergleicht anschließend SHA256-Prüfsummen. Andere Themes werden nicht bearbeitet.

### Aktualisieren und entfernen

Vor einem manuellen Update den vorhandenen `hypershift`-Ordner außerhalb von `themes` sichern. Danach durch den neuen Release-Ordner ersetzen und das Theme neu laden. Der optionale Installer übernimmt die Sicherung automatisch.

Zum Entfernen in Millennium ein anderes Design beziehungsweise den Standard auswählen. Anschließend den Ordner `millennium\themes\hypershift` entfernen. Backups werden separat aufbewahrt und lassen sich bei Bedarf zurückkopieren.

### Darstellung und Bedienung

- Linke Suche: alle sichtbaren Bibliotheksspiele lokal filtern. Klick auf einen Titel: Hauptspiel auswählen.
- **SPIELEN**: nutzt einen verfügbaren nativen Spielbutton. **ZUM SPIEL**: öffnet die Steam-Spielseite, falls noch kein nativer Spielbutton verfügbar ist.
- **Bibliothek**: originale Steam-Regale, Sammlungen und Filter öffnen.
- Logo-Menü: über HYPERSHIFT fahren oder die nativen Menüpunkte mit der Tastatur fokussieren.
- Millennium-Themeoptionen: eigene Bibliotheksstartseite ein-/ausschalten; Kopfzeilenlayout auswählen.

Falls eine neue Steam-Version Darstellung oder Funktion verändert, HYPERSHIFT vorübergehend deaktivieren und einen Fehlerbericht mit Steam-/Millennium-Version, Fenstergröße und betroffenem Bereich erstellen.

## English

Requires Windows Steam desktop and [Millennium](https://steambrew.app/). Enable JavaScript for this theme in Millennium.

1. Download and extract the HYPERSHIFT-Millennium release ZIP.
2. Copy the included `hypershift` directory to `<Steam installation>/millennium/themes/`.
3. Ensure `skin.json` is directly inside `themes/hypershift`, without an extra nested directory.
4. Select HYPERSHIFT in Millennium's theme settings, enable theme JavaScript and reload.
5. Reopen friends/chat/settings/overlay windows if needed. If an existing game retains old overlay styles, check again on its next regular launch.

The optional `Install.ps1` supports `-SteamPath` and `-WhatIf`. It backs up an existing theme, copies only installation files and verifies SHA256 hashes. It does not stop Steam or games, download software, modify settings or touch other themes. Run with elevated Windows permissions only if your Steam directory requires them.

For a manual update, back up the current theme outside `themes`, replace it with the new release and reload. To uninstall, select another/default theme in Millennium, then remove only the `hypershift` directory. Backups are separate.

The custom sidebar lists the current account's visible games. A title selects the home-page feature. The yellow action uses the available native play control, otherwise it opens Steam's game detail page. The Library button opens native shelves, collections and filters. Theme-added labels currently use German.

This package is for the Windows desktop client. Steam store pages and Big Picture receive accent styling, not a full replacement layout. Steam updates may require selector adjustments.

## Reference

Theme configuration follows [Millennium's configuration documentation](https://docs.steambrew.app/themes/basics/config). Publishing this repository does not itself register a theme in the Steam Homebrew catalogue.
