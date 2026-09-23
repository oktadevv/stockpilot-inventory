@echo off
title StockPilot Server
cd /d "%~dp0"
echo ============================================
echo  StockPilot Inventory - starting server...
echo ============================================
"C:\Program Files\nodejs\npm.cmd" run dev
echo.
echo Server stopped. Press any key to close.
pause >nul
