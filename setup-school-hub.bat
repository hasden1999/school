@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul 2>nul
title تثبيت وتهيئة سيرفر منظومة النخبة على الحاسبة
color 0B

echo =====================================================================
echo          تثبيت وتهيئة سيرفر مدرسة النخبة على هذه الحاسبة
echo =====================================================================
echo.

:: 1. التحقق من Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] خطأ: يرجى تثبيت Node.js أولاً من https://nodejs.org
    echo ثم أعد تشغيل هذا الملف.
    echo.
    pause
    exit /b
)

:: 2. فحص الحزم
if not exist "node_modules" (
    echo [1/4] جاري تثبيت الحزم الأساسية...
    call npm install
)

echo [2/4] جاري توليد محرك قواعد البيانات Prisma...
call npx prisma generate

echo [3/4] جاري بناء ملفات الإنتاج...
call npm run build

echo [4/4] جاري إنشاء أيقونة واختصار للمنظومة على سطح المكتب...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\منظومة مدرسة النخبة.lnk'); $Shortcut.TargetPath = '%~dp0start-school-server.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'سيرفر منظومة النخبة المدرسية'; $Shortcut.Save()"

echo.
echo =====================================================================
echo [✓] اكتمل التثبيت والتهيئة بنجاح 100%!
echo [✓] تم إنشاء أيقونة "منظومة مدرسة النخبة" على سطح المكتب.
echo =====================================================================
echo.
pause
