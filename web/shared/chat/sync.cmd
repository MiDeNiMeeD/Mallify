@echo off
REM Sync the canonical chat module into each app's src/chat folder.
REM Run from anywhere; uses the location of this script as the source.

setlocal
set "SRC=%~dp0"
set "ROOT=%SRC%..\..\.."

echo Syncing chat module from %SRC%

for %%T in (
  "%ROOT%\web\admin\src\chat"
  "%ROOT%\web\manager\store\src\chat"
  "%ROOT%\web\store\src\chat"
) do (
  echo   -^> %%~T
  if exist "%%~T" rmdir /S /Q "%%~T"
  xcopy /E /I /Y /Q "%SRC%" "%%~T" >nul
  if exist "%%~T\sync.cmd" del "%%~T\sync.cmd"
  if exist "%%~T\README.md" del "%%~T\README.md"
)

echo Done.
endlocal
