' Ask Users for which Browser he is installing: option 1: Firefox, option 2: Chrome, Edge (Chromium)

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

' ----- initialize path and url variables -----
chromiumURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-chromium.zip"
firefoxURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download/NICHT-Herunterlden-win-x64-firefox.zip"
webserverURL = "https://github.com/NilsPvR/Gleitzeitkonto-Browser/releases/latest/Download//NICHT-Herunterlden-win-x64-webserver.zip"

set objWShell = CreateObject("WScript.Shell")
userprofile = objWShell.ExpandEnvironmentStrings("%userprofile%")
localPrograms = userprofile + "\AppData\Local\Programs"
installationFolder = localPrograms + "\Gleitzeitkonto-Browser"
appDataFolder = objWShell.ExpandEnvironmentStrings("%appdata%")

set FSO = CreateObject("Scripting.FileSystemObject")
if not (FSO.FolderExists(installationFolder)) then
    FSO.CreateFolder(installationFolder)
end if

' ----- Download -----
strAnswer = InputBox("Bitte w" + ChrW(&H00E4) + "hle f" + ChrW(&H00FC) + "r welchen Browser du die Extension installieren m" + ChrW(&H00F6) + "chtest:" + Chr(13) + "1: Firefox" + Chr(13) + "2: Chrome, Edge (Chromium)" + Chr(13) + "3: Mehrere Browser", "Gleitzeitkonto-Browser", "Zahl eingeben")

if strAnswer = "" then
    Wscript.Quit
end if


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


' Download Webserver
filedir = installationFolder + "\" + Split(webserverURL, "/")(8)
call download(webserverURL, fileDir)

' Unzip Webserver
call unzip(fileDir, installationFolder) ' get all items in zip
call FSO.DeleteFile(fileDir, true)


' Download Browser Extension
if (strAnswer = "1") then
    fileDir =  installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

elseif (strAnswer = "2") then
    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)

    
elseif (strAnswer = "3") then
    fileDir = installationFolder + "\" + Split(firefoxURL, "/")(8)
    call download(firefoxURL, fileDir) ' do not unzip for firefox

    fileDir = installationFolder + "\" + Split(chromiumURL, "/")(8)
    call download(chromiumURL, fileDir)
    call unzip(fileDir, installationFolder)
    call FSO.DeleteFile(fileDir)

else
    Wscript.Quit
end if


' ----- Create Shortcut for Webserver Startup -----
strProgramTitle = "Start Gleitzeitkonto-Webserver"
strProgram = installationFolder + "\start-Gleitzeitkonto-Webserver.vbs"
strTarget = appDataFolder + "\Microsoft\Windows\Start Menu\Programs\Startup\"
strIcon = installationFolder + "\icon.ico"

set objShortcut = objWShell.CreateShortcut(strTarget + "\" + strProgramTitle + ".lnk")
objShortcut.TargetPath = strProgram
objShortcut.Description = strProgramTitle
objShortcut.IconLocation = strIcon
objShortcut.Save

Wscript.Echo "Installation erfolgreich abgeschlossen"