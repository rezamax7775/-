@echo off
title CRM App Server
:: تغییر مسیر به پوشه برنامه
cd /d "%~dp0"

:: بررسی وجود پوشه node_modules، اگر نبود نصب کند
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: بررسی وجود پوشه dist، اگر نبود برنامه را بیلد کند
if not exist dist (
    echo Building frontend files...
    call npm run build
)

:: اجرای برنامه در حالت نهایی
echo Starting CRM Server...
npm run start
pause
