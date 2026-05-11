@echo off
echo Installing Al-Yaser Dashboard dependencies...
echo.
echo If this fails, please run PowerShell as Administrator and execute:
echo Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
echo.
npm install
echo.
echo Installation complete!
echo.
echo To start the development server, run:
echo npm run dev
echo.
pause
