# Gleitzeitkonto-Browser - Anzeigen der Überstunden per Erweiterung

Die Browser Erweiterung, die das aktuelle Gleitzeitkonto anzeigt. Man muss nicht mehr umständlich die Überstunden ausrechnen oder aus PDF-Datein ablesen. Es werden einfach im Fiori-Launchpad auf der Seite der Zeiterfassung die aktuellen Überstunden angezeigt.
Alternativ: [Gleitzeitkonto-Desktop](https://github.com/julius-boettger/gleitzeitkonto-desktop)
<br><br>
*Das Gleitzeitkonto im Fiori-Launchpad:*
<br>
![Gleitzeitkonto im Fiori-Launchpad](./assets/gleitzeitkonto-fiorilaunchpad.png)

> ### 🚨 Disclaimer
> Dies ist **keine offizielle Software** und auch nicht in irgendeiner Form mit Fiori oder SAP verbunden! Es gibt **keine Gewährleistung** für die Richtigkeit der Überstunden!

# Installation
Die Erweiterung muss im entsprechenden Browser installiert werden:
- [Installation Firefox](https://github.com/NilsPvR/Gleitzeitkonto-Browser/wiki/Firefox-Installation)
- [Installation Chrome](https://chromewebstore.google.com/detail/gleitzeitkonto-browser/pfafglenejhimeinpohlpdobpnmocddj)
- [Installation Edge](https://microsoftedge.microsoft.com/addons/detail/ionekooopielnnakholllacpgnlkjikm)

*Probleme? Erstelle ein [Issue](https://github.com/NilsPvR/Gleitzeitkonto-Browser/issues)*

# Deinstallation
Zum Deinstallieren von Gleitzeitkonto-Browser die Erweiterung einfach entfernen:
- [Deinstallation Firefox](https://support.mozilla.org/de/kb/addons-deaktivieren-oder-deinstallieren)
- [Deinstallation Chrome](https://support.google.com/chrome_webstore/answer/2664769?hl=de)
- [Deinstallation Edge](https://support.microsoft.com/de-de/microsoft-edge/erweiterungen-in-microsoft-edge-hinzuf%C3%BCgen-ausschalten-oder-entfernen-9c0ec68c-2fbc-2f2c-9ff0-bdc76f46b026)

## Deinstallation vor V3
In älteren Versionen musste zusätzlich ein Programm (CompanionApp) und Node.js installiert werden. Zum Deinstallieren folgende Schritte befolgen:
1. Die Erweiterung aus dem Browser entfernen (siehe oben)
2. Das [Deinstallations-Skript](https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/download/v2.0.1/uninstall_Gleitzeitkonto-Browser-GUI.hta) herunterladen und ausführen.<br>
3. (optional) Node.js deinstallieren

# Funktionsweise

Da die Browser Erweiterung Zugriff auf den Kontext von Fiori hat, kann diese auch Anfragen direkt an den Fiori-Server schicken. Es wird somit eine Anfrage geschickt, um die Arbeitszeiten abzufragen. Aus den Arbeitszeiten werden im Hintergrund die aktuellen Überstunden berechnet. Diese werden dann in der Erweiterung angezeigt.

# Idee
Das Gleitzeitkonto-Projekt (API, Desktop und Browser) ist entstanden, da es keine einfache Möglichkeit gab, die Überstunden einzusehen. Dies ist relevant, wenn man in manchen Wochen mehr als die geforderte Wochenstundenzahl arbeitet und in der anderen Woche entsprechend weniger arbeiten möchte.
