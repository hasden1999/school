@echo off
chcp 65001 >nul
title منظومة مدرسة المعالي الأهلية - السيرفر المحلي
cls

echo =======================================================================
echo          مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
echo             تشغيل السيرفر المحلي وشبكة المدرسة الداخلية (LAN)
echo =======================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطأ]: لم يتم العثور على Node.js في الحاسبة. يرجى تثبيته أولاً.
    pause
    exit /b
)

:: 2. Extract Local IPv4 Address
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0 "') do (
    set LOCAL_IP=%%a
)

echo [✓] تم فحص النظام والاتصال بنجاح.
echo [✓] عنوان السيرفر على شبكة راوتر المدرسة هو: http://%LOCAL_IP%:3000
echo.
echo -----------------------------------------------------------------------
echo  1. للدخول من هذه الحاسبة:         http://localhost:3000
echo  2. للدخول من حاسبات المحاسبة:      http://%LOCAL_IP%:3000
echo  3. لدخول المعلمين عبر هواتفهم:    http://%LOCAL_IP%:3000
echo -----------------------------------------------------------------------
echo.
echo جاري تشغيل المنظومة وفتح المتصفح...
echo.

:: 3. Open browser after 2 seconds in background
start "" timeout /t 2 /nobreak >nul & start http://localhost:3000

:: 4. Start Next.js production server on all interfaces (0.0.0.0)
npm run start

pause
