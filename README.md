# ==> [Anleitung hier](#1-automatisch) <==

# Gleitzeitkonto-Browser - Anzeigen der Überstunden per Erweiterung

Die Browser Erweiterung, die das aktuelle Gleitzeitkonto mit Hilfe der [Gleitzeitkonto-API](https://github.com/julius-boettger/gleitzeitkonto-api) anzeigt. Man muss nicht mehr umständlich die Überstunden ausrechnen oder aus PDF-Datein ablesen. Es werden einfach im Fiori-Launchpad auf der Seite der Zeiterfassung die aktuellen Überstunden angezeigt, ebenfalls im Popup-Menu der Erweiterung selber.
Alternativ: [Gleitzeitkonto-Desktop](https://github.com/julius-boettger/gleitzeitkonto-desktop)
<br><br>
*Das Gleitzeitkonto im Fiori-Launchpad:*
<br>
![Gleitzeitkonto im Fiori-Launchpad](./Assets/GleitzeitkontoFioriLaunchpad.png)

> ### 🚨 Disclaimer
> Die Erweiterung ist noch in der **BETA Phase**, es fehlen viele Features und wenig ist ordentlich dokumentiert. Dies ist **keine offizielle Software** und auch nicht in irgendeiner Form mit Fiori oder SAP verbunden! Es gibt **keine Gewährleistung** für die Richtigkeit der Überstunden!

# Installation (Windows)
Bisher wurde alles nur auf Windows getestet! Andere Systeme sind daher nur experimentell.

## 1. Automatisch 

1. **[Installations-Skript](https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/download/v1.1.1/install_Gleitzeitkonto-Browser-GUI.hta)** herunterladen und ausführen.
2. [Hinzufügen der Erweiterung](#2-hinzufügen-der-erweiterung)

<details><summary><b>❓ Es kommt eine Fehlermeldung</b></summary>
    <i>Folgende Fehlermeldung kann auftauchen:</i><br>
    <img src="Assets/Errormsg-Scanning-by-Defender.png" alt="Fehlermeldung durch Defender">
    <br><br>
    <p>Die Fehlermeldung taucht auf, wenn der Antivirus, die Datei noch nicht vollständig überprüft und frei gegeben hat. Eine solche Überprüfung passiert automatisch und kann leider einige Zeit dauern.<p>
    <p>Mit Admin Rechten kann diese Überprüfung übersprungen werden.</p>
    <ol>
        <li>"Windows-Sicherheit" öffnen</li>
        <li>"Viren- & Bedrohungsschutz"</li>
        <li>Unter "Einstellungen für Viren- und Bedrohungsschutz": "Einstellungen verwalten"</li>
        <li>Unter "Ausschlüsse" (weit unten): "Ausschlüsse hinzufügen oder entfernen"</li>
        <li>"Ausschluss hinzufügen"</li>
        <li>"Ordner"</li>
        <li><code>%UserProfile%\AppData\Local\Programs</code> in der Adressleite eingeben</li>
        <li>Ordner "Gleitzeitkonto-Browser" auswählen</li>
        <li>"Ordner auswählen"</li>
        <li>Der Antivirus ignoriert nun den Installations-Ordner und das Programm kann ausgeführt werden.
            <ol>
                <li>Hierzu "Windows-Taste" + "R" (gleichzeitig) drücken</li>
                <li><code>%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser</code> eingeben </li>
                <li>"start-Gleitzeitkonto-Webserver.vsb" ausführen</li>
            </ol>
        </li>
    </ol>

</details>

## 2. Hinzufügen der Erweiterung
[Firefox](#firefox) oder [Chrome](#chrome) oder [Edge](#edge)
<br>

### Firefox


1. Der Installations-Ordner wurde bei der Installation automatisch geöffnet
2. Datei mit dem Namen: "Gleitzeitkonto-Browser-Firefox.xpi" öffnen
3. Firefox zum Öffnen wählen + "OK" klicken
4. "Hinzufügen" klicken in Firefox
5. Fertig! 🥳


<details><summary><b>❓ Der InstallationsOrdner ist noch nicht offen</b></summary>
    <ol>
        <li>"Windows-Taste" + "R" (gleichzeitig) drücken</li>
        <li><code>%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser</code> eingeben + "OK" klicken</li>
    </ol>
</details>

<details><summary><b>❓ Die Datei lässt sich nicht mit Firefox öffnen</b></summary>
<ol>
    <li>In Firefox neuen Tab mit <code>about:addons</code> öffnen</li>
    <li>Links "Erweiterungen" auswählen</li>
    <li>"Erweiterungen verwalten" Einstellungsrad klicken</li>
    <li>"Add-on aus Datei installieren..." klicken</li>
    <img src="./Assets/Firefox-installation.png" alt="Installation in Firefox" style="width: 70%;">
    <li>In die Adressleiste <code>%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser</code> eingeben und "Gleitzeitkonto-Browser-Firefox.xpi" auswählen</li>
    <li>"Öffnen" klicken</li>
    <li>Fertig! 🥳</li>
</ol>
</details>

<img alt="Erweiterungsdatei mit Firefox öffnen" src="Assets/Firefox-easy-installation.png" style="height: 250px; margin-left: 1.7rem">



### Chrome
1. In Chrome neuen Tab mit `about:extensions` öffnen
2. Rechts "Entwicklermodus" aktivieren<br>
    <img src="./Assets/chrome-developer-mode.png" style="height: 150px;" alt="Entwicklermodus in Chrome aktivieren">
3. Der Installations-Ordner wurde bei der Installation automatisch geöffnet
4. Per Drag und Drop den Ordner "Chrome-Edge(Chromium)" in das Fenster ziehen<br>
    <img src="./Assets/chrome-installation-draganddrop.PNG" alt="Per Drag und drop die Erweiterung hinzufügen" style="width: 70%;">
5. Fertig! 🥳

<details><summary><b>❓ Ordner nicht offen / Drag und Drop funktioniert nicht</b></summary>
<ol>
    <li>"Entpackte Erweiterung laden" klicken<br>
    <img src="./Assets/chrome-installation.png" alt="Installation in Chrome" style="width: 70%;">
    </li>
    <li>In die Adressleiste <code>%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser</code> eingeben und "Chrome-Edge(Chromium)" auswählen</li>
    <li>"Ordner auswählen" klicken</li>
    <li>Fertig! 🥳</li>
</ol>
</details>



### Edge
1. In Edge neuen Tab mit `about:extensions` öffnen
2. Links "Entwicklermodus" aktivieren<br>
    <img src="./Assets/edge-developer-mode.png" style="height: 150px;" alt="Entwicklermodus in Edge aktivieren">
3. Der Installations-Ordner wurde bei der Installation automatisch geöffnet
4. Per Drag und Drop den Ordner "Chrome-Edge(Chromium)" in das Fenster ziehen<br>
    <img src="./Assets/edge-installation-draganddrop.PNG" alt="Per Drag und drop die Erweiterung hinzufügen" style="width: 70%;">
5. Fertig! 🥳



<details><summary><b>❓ Ordner nicht offen / Drag und Drop funktioniert nicht</b></summary>
<ol>
    <li>"Entpackte Erweiterung laden" klicken<br>
    <img src="./Assets/installation-edge.png" alt="Installation in Edge" style="width: 70%;">
    </li>
    <li>In die Adressleiste <code>%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser</code> eingeben und "Chrome-Edge(Chromium)" auswählen</li>
    <li>"Ordner auswählen" klicken</li>
    <li>Fertig! 🥳</li>
</ol>
</details>



## 1. Manuell (alternativ)
Gleitzeitkonto-Browser kann auch manuell installiert werden. Die Dateien, die unter [releases](https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases) nicht heruntergeladen werden sollen müssen hierfür heruntergeladen werden. Bei vorhandener Node.js Installation kann die webserver-script.zip, ansonsten die webserver.zip Datei, heruntergeladen werden. Die Dateien nun in ein gewünschtes Verzeichnis extrahieren. Bei der Skript-Version [erweiterte Schritte](#experten---nodejs-webserver) beachten.<br>
Das vbscript "start-Gleitzeitkonto-Webserver" kann dazu verwendet werden um den Webserver zu starten. Es kann hierfür eine Verknüpfung erstellt werden, um diese in den Autostart zu legen.

Für die Erweiterung muss die entsprechende .zip oder .xpi Datei heruntergeladen werden. Für Chromium-Browser muss die zip Datei entpackt werden. Für Firefox die .xpi Datei unverändert lassen. Die Dateien können in ein beliebiges Verzeichnis gelegt werden. Anschließend [Hinzufügen der Erweiterung](#2-hinzufügen-der-erweiterung) folgen, mit angepasstem Pfad.
<br><br>

## Node.js-Skript Webserver
Diese Schritte nur folgen, wenn bei der Installation "Hintergrund-Node.js-Skript" ausgewählt wurde. Zunächst muss [Node.js](https://nodejs.org/) zusammen mit npm auf dem PC installiert sein. Falls Node.js erst nach der Installation installiert wird, am besten die Installation erneut durchführen. <br>
Damit der Hintergrund-Prozess (Webserver) funktionieren kann, muss eine URL hinzugefügt werden:
1. "Windows-Taste" + "R" (gleichzeitig) drücken
2. `%UserProfile%\AppData\Local\Programs\Gleitzeitkonto-Browser\Webserver` eingeben
3. Die Datei "url.json" öffnen
4. Zwischen die Anführungszeichen den Link zur "Meine Zeitenübersicht"-Seite im internen Fiori eingeben. Es sollte dann ungefähr so aussehen:
   ```"https://abc.cdef.domain.com:1234/bla/bla/bla#btccatstime-display"```
5. Speichern + Schließen
6. Im selben Ordner "start-Gleitzeitkonto-Webserver.vbs" ausführen, um den Webserver zu starten
7. Der Webserver sollte nun unter [http://localhost:35221](http://localhost:35221) erreichbar sein

# Funktionsweise

Die Gleitzeitkonto-API (wird zur Berechnung benötigt) verwendet [Node.js](https://nodejs.org/). Eine Browser-Erweiterung, bzw. einfach ein Javascript Skript im Browser, hat jeodch keinen Zugriff auf lokale Dateien auf dem Computer und kann auch keine Node-Scripts laufen lassen. Aus diesem Grund ist es nicht möglich direkt auf die API zuzugreifen. Um die Daten von der API zu erhalten muss ein Hintergrund-Programm (ein lokaler Webserver) eingerichtet werden. Ein Webserver ist eine Webseite wie "wikipedia.org" nur läuft diese lokal, auf dem PC. Der Webserver verwendet die API und stellt die Daten dann über Webrequests (Aufrufe der Seite) zur Verfügung. Dies kann auch nachvollzogen werden indem die [lokale Seite](http://localhost:35221) aufgerufen wird. <br>
Zur Funktionsweise der API kann die [README](https://github.com/julius-boettger/gleitzeitkonto-api#readme) des repos gelesen werden.<br>
Die Browser-Erweiterung ruft den lokalen Webserver auf und erhält hierüber die Daten zum Gleitzeitkonto. Diese werden dann im Popup und auf der Fiori-Seite angezeigt. Die Browser-Erweiterung kann also nicht ohne das Hintergrund-Programm / den Webserver funktionieren.

Der Webserver muss kontinuierlich im Hintergrund laufen. Es ist leider nicht möglich, um den Webserver nur bei Bedarf von der Browser-Erweiterung heruas zu starten. Für den Webserver läuft ein Hintergrund Prozess, den man im Task-Manager unter "Details" mit dem Namen "Gleitzeitkonto-Webserver.exe" bzw. "node.exe" finden kann. Hierzu wird normalerweise ca. 20 - 40 MB RAM verbraucht. Solange der Webserver nicht aufgerufen wird, wird jedoch die CPU nicht (nur minimal) verwendet.<br>

# Idee
Das Gleitzeitkonto-Projekt (API, Dekstop und Browser) ist enstanden, da es keine einfache Möglichkeit gab die Überstunden einzusehen. Dies ist relevant, wenn man in manchen Wochen mehr als die geforderte Wochenstundenzahl arbeitet und in der anderen Woche entsprechend weniger arbeiten möchte.
