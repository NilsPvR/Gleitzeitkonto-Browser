' This script is an installation for the Gleitzeitkonto-Browser and does summed up the following

' Ask Users for which Browser he is installing: option 1: Firefox, option 2: Chrome, Edge (Chromium), option 3: multiple
' Ask User which Webserver he is installing: option 1: packed, option 2: unpacked, option 3: none
' Confirm installation parts

' Download zip file from Github to %Local AppData%/Programs/Gleitzeitkonto-Browser
' https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-chromium.zip
' https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-firefox.zip
' https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-webserver.zip

' Extract zip contents
    ' Webserver folder
        ' Gleitzeitkonto-Webserver.exe
        ' Startup Script
    ' Erweiterung folder
        ' Assets
        ' Popup
        ' ....

' Create Shortcut for startWebserver.vbs in %AppData%\Microsoft\Windows\Start Menu\Programs\Startup\
' Inform user about successful installation
' Start Webserver

' ----- initialize path and url variables -----
chromiumURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/download/NICHT-Herunterladen-win-x64-chromium.zip"
firefoxURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/download/NICHT-Herunterladen-win-x64-firefox.xpi"
packedWebserverURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/download/NICHT-Herunterladen-win-x64-webserver.zip"
unpackedWebserverURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/download/NICHT-Herunterladen-win-x64-webserver-script.zip"

set objWShell = CreateObject("WScript.Shell")
userprofile = objWShell.ExpandEnvironmentStrings("%userprofile%")
localPrograms = userprofile + "\AppData\Local\Programs"
installationFolder = localPrograms + "\Gleitzeitkonto-Browser"
webserverFolder = installationFolder + "\Webserver"
appDataFolder = objWShell.ExpandEnvironmentStrings("%appdata%")

boxTitle = "Gleitzeitkonto-Browser"

set FSO = CreateObject("Scripting.FileSystemObject")
' create installation folder if not already present
if not (FSO.FolderExists(installationFolder)) then
    FSO.CreateFolder(installationFolder)
end if

' ----- Subs Download and Unzip -----
sub download (url, fileDir)
    set objHTTP = CreateObject( "WinHttp.WinHttpRequest.5.1" )
    call objHTTP.open("GET", url, False)
    objHTTP.send

    set objFSO = CreateObject("Scripting.FileSystemObject")
    dim bStrm: set bStrm = Createobject("Adodb.Stream")


    with bStrm
        .type = 1 ' binary
        .open
        .write objHTTP.responseBody
        .savetofile fileDir, 2 'overwrite
    end with
end sub

sub unzip(source, target)
    set objShell = CreateObject("Shell.Application")

    set filesInZip = objShell.NameSpace(source).Items ' get all items in zip
    call objShell.NameSpace(target).CopyHere(filesInZip, &H14&) ' extract the items
end sub

sub killWebserver (pstrWebserverAnswer)
    ' ----- Kill old Webserver if existant -----
    On Error Resume Next ' define only in sub to ignore error when Webserver not running
    if (pstrWebserverAnswer = "1" OR pstrWebserverAnswer = "2") then
        set objHTTP = CreateObject( "WinHttp.WinHttpRequest.5.1" )
        call objHTTP.open("GET", "http://localhost:35221/kill", False)
        objHTTP.send
    end if
end sub

' ----- Ask for input -----
function askBrowser ()
    strBrowserAnswer = InputBox("Installation f" + ChrW(&H00FC) + "r Gleitzeitkonto-Browser gestartet!" + ChrW(13) + _
        Chr(13) + _
        "Bitte w" + ChrW(&H00E4) + "hle f" + ChrW(&H00FC) + "r welchen Browser du die Erweiterung installieren m" + _
        ChrW(&H00F6) + "chtest:" + Chr(13) + _
        "1: Firefox" + Chr(13) + _
        "2: Chrome/Edge (Chromium)" + Chr(13) + _ 
        "3: Mehrere Browser" + Chr(13) + _
        "4: Keine Erweiterung installieren", _
    boxTitle, _
    "Zahl eingeben")

    if (strBrowserAnswer = "") then
        MsgBox "Installation abgebrochen.", 0, boxTitle
        Wscript.Quit
    elseif NOT (strBrowserAnswer = "1" OR strBrowserAnswer = "2" OR strBrowserAnswer = "3" OR strBrowserAnswer = "4") then
        MsgBox "'" + strBrowserAnswer + "' ist eine ung" + ChrW(&H00FC) + "ltige Eingabe.", 0, boxTitle
        askBrowser = askBrowser()
    end if

    askBrowser = strBrowserAnswer
end function

function askWebserver ()
    strWebserverAnswer = InputBox("Gleitzeitkonto-Browser ben" + ChrW(&H00F6) + "tigt einen Hintergrund-Prozess (Webserver) zum Funktionieren." + Chr(13) + _
        Chr(13) + _
        "Welche Version soll installiert werden?" + _
        " (Nur abw" + ChrW(&H00E4) + "hlen, wenn bereits installiert)" + Chr(13) + _
        Chr(13) + _
        "1: Hintergrund-Package (Empfohlen)" + Chr(13) + _
        "2: Hintergrund-Node.js-Skript" + Chr(13) + _
        "3: Hintergrund-Prozess NICHT installieren", _
    boxTitle, _
    "1")

    if (strWebserverAnswer = "") then
        MsgBox "Installation abgebrochen.", 0, boxTitle
        Wscript.Quit
    elseif NOT (strWebserverAnswer = "1" OR strWebserverAnswer = "2" OR strWebserverAnswer = "3") then
        MsgBox "'" + strWebserverAnswer + "' ist eine ung" + ChrW(&H00FC) + "ltige Eingabe.", 0, boxTitle
        askWebserver = askWebserver()
    end if

    askWebserver = strWebserverAnswer
end function

strBrowserAnswer = askBrowser()
strWebserverAnswer = askWebserver()


strInstallParts = ""
if (strBrowserAnswer = "1") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Erweiterung Firefox"
if (strBrowserAnswer = "2") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Erweiterung Chrome/Edge (Chromium)"
if (strBrowserAnswer = "3") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Erweiterung Firefox + Chrome/Edge (Chromium)"
if (strWebserverAnswer = "1") then strInstallParts = strInstallParts + Chr(13) + "- Hintergrund-Package"
if (strWebserverAnswer = "2") then strInstallParts = strInstallParts + Chr(13) + "- Hintergrund-Node.js-Skript"

if (strBrowserAnswer = "4" and strWebserverAnswer = "3") then' nothing to install
    MsgBox "Es wurden keine Komponenten zum Installieren ausgew" + ChrW(&H00E4) + "hlt. Installation wird beendet.", 0, boxTitle
    Wscript.Quit
end if

continueRespone = MsgBox("Folgende Komponenten werden installiert:" + Chr(13) + strInstallParts + Chr(13) + Chr(13) + "Fortfahren?", "1", boxTitle)

if (continueRespone = "2") then 
    MsgBox "Installation abgebrochen", 0, boxTitle
    Wscript.Quit
end if

' ----- Download Browser Erweiterung -----
if (strBrowserAnswer = "1") then ' Firefox
    fileDir =  installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

    oldFirefoxXPI = installationFolder + "\Gleitzeitkonto-Browser-Firefox.xpi"
    if (FSO.FileExists(oldFirefoxXPI)) then ' if old file available delete it
        call FSO.DeleteFile(oldFirefoxXPI)
    end if
    call FSO.MoveFile(fileDir, oldFirefoxXPI) ' rename download file

elseif (strBrowserAnswer = "2") then ' Chromium
    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)

    
elseif (strBrowserAnswer = "3") then ' Firefox + Chromium
    fileDir = installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

    oldFirefoxXPI = installationFolder + "\Gleitzeitkonto-Browser-Firefox.xpi"
    if (FSO.FileExists(oldFirefoxXPI)) then ' if old file available delete it
        call FSO.DeleteFile(oldFirefoxXPI)
    end if
    call FSO.MoveFile(fileDir, oldFirefoxXPI) ' rename download file

    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)
end if

call killWebserver(strWebserverAnswer)

' ----- Download Webserver -----
if (strWebserverAnswer = "1") then
    filedir = installationFolder + "\" + Split(packedWebserverURL, "/")(8)
    call download(packedWebserverURL, fileDir)

    ' Unzip Webserver
    call unzip(fileDir, installationFolder) ' get all items in zip
    call FSO.DeleteFile(fileDir, true)

elseif strWebserverAnswer = "2" then
    filedir = installationFolder + "\" + Split(unpackedWebserverURL, "/")(8)
    call download(unpackedWebserverURL, fileDir)

    ' Unzip Webserver
    call unzip(fileDir, installationFolder) ' get all items in zip
    call FSO.DeleteFile(fileDir, true)
end if

' ----- Create Shortcut for Webserver Startup -----
if (strWebserverAnswer = "1" OR strWebserverAnswer = "2") then

    strProgramTitle = "Start Gleitzeitkonto-Webserver"
    strProgram = webserverFolder + "\start-Gleitzeitkonto-Webserver.vbs"
    strTarget = appDataFolder + "\Microsoft\Windows\Start Menu\Programs\Startup\"
    strIcon = webserverFolder + "\icon.ico"

    set objShortcut = objWShell.CreateShortcut(strTarget + "\" + strProgramTitle + ".lnk")
    objShortcut.TargetPath = strProgram
    objShortcut.Description = strProgramTitle
    objShortcut.WorkingDirectory = webserverFolder
    objShortcut.IconLocation = strIcon
    objShortcut.Save

end if

' ----- Start or perpare webserver -----

if (strWebserverAnswer = "1") then ' when packed version is selected
    objWShell.Run(webserverFolder + "\Gleitzeitkonto-Webserver.exe", 0, true)
end if

if (strWebserverAnswer = "2") then ' unpacked version selected
    ' try to install npm packages
    objWShell.Run("cmd /c cd /d " & webserverFolder & " && " & "npm install", 0, true)
end if


' ===== Installation finished =====
if (strWebserverAnswer = "2") then
        openLinkAnswer = MsgBox("!!!!" + Chr(13) + "Beachte die Installations Hinweise unter 'Nodes.js-Skript Webserver':  https://github.com/NilsPvR/Gleitzeitkonto-Browser#nodejs-skript-webserver" + _
        " um Gleitzeitkonto-Browser final einzurichten." + Chr(13) + "!!!!" + Chr(13) + _
        Chr(13) + "Website " + ChrW(&H00F6) + "ffnen?", 4, boxTitle)

    if (openLinkAnswer = "6") then ' yes
        CreateObject("WScript.Shell").Run("https://github.com/NilsPvR/Gleitzeitkonto-Browser#nodejs-skript-webserver"), 0 ' open website
    end if
end if

if (strBrowserAnswer = "1" OR strBrowserAnswer = "2" OR strBrowserAnswer = "3") then 'a browser got selected, ask to open the folder
    openExplorerAnswer = MsgBox("Soll der Ordner zum Installieren der Browser-Erweiterung ge" + ChrW(&H00F6) + "ffnet werden?", 4, boxTitle)

    if (openExplorerAnswer = "6") then 'yes clicked
        CreateObject("Shell.Application").Explore userprofile + "\AppData\Local\Programs\Gleitzeitkonto-Browser" 'open a explorer window
    end if
end if

MsgBox "Installation erfolgreich abgeschlossen", 0, boxTitle
