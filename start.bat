@echo off
title SES Fullstack Launcher
echo ===================================================
echo             SES FULLSTACK APPLICATION
echo ===================================================
echo.
echo [1/3] Django backendni ishga tushirish...
start "SES Django Backend" cmd /k "cd /d D:\SES\backend && venv\Scripts\python.exe manage.py runserver"

echo [2/3] Django ishga tushishini kutilmoqda (3 soniya)...
timeout /t 3 /nobreak > nul

echo [3/3] React frontendni ishga tushirish...
start "SES React Frontend" cmd /k "cd /d D:\SES\frontend && npm run dev"

echo.
echo Barchasi tayyor! Brauzer ochilmoqda (http://localhost:5173)...
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
echo ===================================================
echo Dasturlarni yopish uchun ularning konsol oynalarini yoping.
echo ===================================================
echo.
pause
