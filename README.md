# Gleitzeitkonto-Browser - Anzeigen der Überstunden per Extension

Die Browser Extension, die das aktuelle Gleitzeitkonto mit Hilfe der [Gleitzeitkonto-API](https://github.com/julius-boettger/gleitzeitkonto-api) anzeigt. Man muss nicht mehr umständlich die Überstunden ausrechnen oder aus PDF-Datein ablesen. Es werden einfach im Fiori-Launchpad auf der Seite der Zeiterfassung die aktuellen Überstunden angezeigt. Ebenfalls ist es möglich die Überstunden im Popup-Menu der Extension selber einzusehen.
<br><br>
*Das Gleitzeitkonto im Fiori-Launchpad:*
<br>
![Gleitzeitkonto im Fiori-Launchpad](./GleitzeitkontoFioriLaunchpad.png)

Das Gleitzeitkonto-Projekt ist enstanden, da es keine einfache Möglichkeit gab die Überstunden einzusehen. Dies ist relevant, wenn man in manchen Wochen mehr als die geforderte Wochenstundenzahl arbeitet und in der anderen Woche entsprechend weniger arbeiten möchte.

### Disclaimer

Dies ist keine offizielle Software und auch nicht in irgendeiner Form mit Fiori oder SAP verbunden! Es gibt keine Gewährleistung für die Richtigkeit der Überstunden!

## Installation



## Funktionsweise

Die Gleitzeitkonto-API verwendet [Node.js](https://nodejs.org/). Eine Browser-Extension hat jeodch keinen Zugriff auf lokale Dateien auf dem Computer und kann auch keine Node-Scripts laufen lassen, deshalb ist es nicht möglich direkt auf die API zuzugreifen. Um die Daten zu erhalten muss ein lokaler Webserver eingerichtet werden. Der Webserver verwendet die API und stellt die Daten dann über Webrequests zur Verfügung. Zur Funktionsweise der API kann die [README](https://github.com/julius-boettger/gleitzeitkonto-api#readme) des repos gelesen werden.<br>
Die Browser-Extension ruft den lokalen Webserver auf und erhält hierüber die Daten zum Gleitzeitkonto. Diese werden dann im Popup und auf der Fiori-Seite angezeigt. Die Browser-Extension kann also 

RAM Verbrauch: 33,6 / 49,9 MB in Powershell
    19,2 / 26,6 MB in Node CMD
    26,3 / 26,3 MB in CMD
    minimale Version ohne Hostfenster: Node.js Javascript Runtime: 18,8 MB und Konsolenfenster: 0,9 MB