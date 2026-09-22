@echo off
title StockPilot Server
cd /d "%~dp0"
echo ============================================
echo  StockPilot Inventory - menyalakan server...
echo ============================================
"C:\Program Files\nodejs\npm.cmd" run dev
echo.
echo Server berhenti. Tekan tombol apa saja untuk tutup.
pause >nul
