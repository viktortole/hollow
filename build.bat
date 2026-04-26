@echo off
cd /d "%~dp0"
echo Building Hollow Fasting Widget...
echo.
npm run tauri build
echo.
echo =============================================
echo Build complete!
echo Look for the installer in:
echo src-tauri\target\release\bundle\nsis\
echo =============================================
pause
