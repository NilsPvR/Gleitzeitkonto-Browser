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
    ' Extension folder
        ' Assets
        ' Popup
        ' ....

' Create Shortcut for startWebserver.vbs in %AppData%\Microsoft\Windows\Start Menu\Programs\Startup\
' Inform user about successful installation
' Start Webserver

' ----- initialize path and url variables -----
chromiumURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-chromium.zip"
firefoxURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-firefox.xpi"
packedWebserverURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-webserver.zip"
unpackedWebserverURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-webserver-script.zip"

set objWShell = CreateObject("WScript.Shell")
userprofile = objWShell.ExpandEnvironmentStrings("%userprofile%")
localPrograms = userprofile + "\AppData\Local\Programs"
installationFolder = localPrograms + "\Gleitzeitkonto-Browser"
appDataFolder = objWShell.ExpandEnvironmentStrings("%appdata%")

boxTitle = "Gleitzeitkonto-Browser"

set FSO = CreateObject("Scripting.FileSystemObject")
if not (FSO.FolderExists(installationFolder)) then
    FSO.CreateFolder(installationFolder)
end if

' ----- Subs Download and Unzip -----
function download (url, fileDir)
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
end function

function unzip(source, target)
    set objShell = CreateObject("Shell.Application")

    set filesInZip = objShell.NameSpace(source).Items ' get all items in zip
    objShell.NameSpace(target).CopyHere(filesInZip) ' extract the items
end function


' ----- Ask for input -----
strBrowserAnswer = InputBox("Installation f" + ChrW(&H00FC) + "r Gleitzeitkonto-Browser gestartet!" + ChrW(13) + _
        Chr(13) + _
        "Bitte w" + ChrW(&H00E4) + "hle f" + ChrW(&H00FC) + "r welchen Browser du die Extension installieren m" + _
        ChrW(&H00F6) + "chtest:" + Chr(13) + _
        "1: Firefox" + Chr(13) + _
        "2: Chrome/Edge (Chromium)" + Chr(13) + _ 
        "3: Mehrere Browser" + Chr(13) + _
        "4: Keine Extension installieren", _
    boxTitle, _
    "Zahl eingeben")

if (strBrowserAnswer = "") then
    MsgBox "Installation abgebrochen.", 0, boxTitle
    Wscript.Quit
elseif NOT (strBrowserAnswer = "1" OR strBrowserAnswer = "2" OR strBrowserAnswer = "3" OR strBrowserAnswer = "4") then
    MsgBox "'" + strBrowserAnswer + "' ist eine ung" + ChrW(&H00FC) + "ltige Eingabe. Installation wird abgebrochen", 0, boxTitle
    Wscript.Quit
end if


strWebserverAnswer = InputBox("Bitte w" + ChrW(&H00E4) + "hle, welcher Gleitzeitkonto-Webserver installiert werden soll. (Dieser wird ben" + ChrW(&H00F6) + "tigt." + _
        "Bitte nur abw" + ChrW(&H00E4) + "hlen, wenn bereits installiert.)" + Chr(13) + _
        Chr(13) + _
        "1: Webserver-Package (Node.js ist nicht installiert)" + Chr(13) + _ 
        "2: Webserver-Node.js-Skript (Node.js ist bereits installiert)" + Chr(13) + _        
        "3: Webserver NICHT installieren", _
    boxTitle, _
    "1")

if (strWebserverAnswer = "") then
    MsgBox "Installation abgebrochen.", 0, boxTitle
    Wscript.Quit
elseif NOT (strWebserverAnswer = "1" OR strWebserverAnswer = "2" OR strWebserverAnswer = "3") then
    MsgBox "'" + strWebserverAnswer + "' ist eine ung" + ChrW(&H00FC) + "ltige Eingabe. Installation wird abgebrochen", 0, boxTitle
    Wscript.Quit
end if

strInstallParts = ""
if (strBrowserAnswer = "1") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Extension Firefox"
if (strBrowserAnswer = "2") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Extension Chrome/Edge (Chromium)"
if (strBrowserAnswer = "3") then strInstallParts = strInstallParts + Chr(13) + "- Browser-Extension Firefox + Chrome/Edge (Chromium)"
if (strWebserverAnswer = "1") then strInstallParts = strInstallParts + Chr(13) + "- Webserver-Package"
if (strWebserverAnswer = "2") then strInstallParts = strInstallParts + Chr(13) + "- Webserver-Node.js-Skript"

continueRespone = MsgBox("Folgende Komponenten werden installiert:" + Chr(13) + strInstallParts + Chr(13) + Chr(13) + "Fortfahren?", "1", boxTitle)

if (continueRespone = "2") then 
    MsgBox "Installation abgebrochen", 0, boxTitle
    Wscript.Quit
end if

' ----- Download Browser Extension -----
if (strBrowserAnswer = "1") then
    fileDir =  installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

elseif (strBrowserAnswer = "2") then
    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)

    
elseif (strBrowserAnswer = "3") then
    fileDir = installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)
end if

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
    strProgram = installationFolder + "\start-Gleitzeitkonto-Webserver.vbs"
    strTarget = appDataFolder + "\Microsoft\Windows\Start Menu\Programs\Startup\"
    strIcon = installationFolder + "\icon.ico"

    set objShortcut = objWShell.CreateShortcut(strTarget + "\" + strProgramTitle + ".lnk")
    objShortcut.TargetPath = strProgram
    objShortcut.Description = strProgramTitle
    objShortcut.WorkingDirectory = installationFolder
    objShortcut.IconLocation = strIcon
    objShortcut.Save

    CreateObject("Wscript.Shell").Run installationFolder + "\Gleitzeitkonto-Webserver.exe", 0
end if


MsgBox "Installation erfolgreich abgeschlossen", 0, boxTitle
