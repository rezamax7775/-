@echo off
title CRM App Server
:: تغییر مسیر به پوشه برنامه (فرض بر این است که فایل bat در پوشه اصلی پروژه است)
cd /d "%~dp0"

:: بررسی وجود پوشه node_modules، اگر نبود نصب کند
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: اجرای برنامه در حالت نهایی
echo Starting CRM Server...
npm run start
pause
