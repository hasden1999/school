@echo off
chcp 65001 >nul
title تجهيز حزمة تثبيت منظومة النخبة للمدارس (Package School Installer)
color 0E

echo =====================================================================
echo          تجهيز حزمة التوزيع الرسمية لمنظومة النخبة للمدارس
echo =====================================================================
echo.
echo [*] جاري فحص ملفات الإنتاج الجاهزة...

if not exist ".next" (
    echo [!] جاري بناء ملفات الإنتاج أولاً لضمان السرعة...
    call npm run build
)

set ZIP_NAME=Nukhba_School_Offline_Setup.zip

echo [*] جاري ضغط ملفات المنظومة في ملف واحد: %ZIP_NAME% ...

powershell -Command "Compress-Archive -Path 'package.json', 'start-school-server.bat', 'setup-school-hub.bat', 'prisma', 'public', '.next', '.env' -DestinationPath '%ZIP_NAME%' -Force"

echo.
echo =====================================================================
echo [✓] تم إنشاء ملف التثبيت بنجاح تام!
echo.
echo اسم الملف الجاهز للإرسال للمدارس:
echo >> %~dp0%ZIP_NAME%
echo.
echo كل ما على المدرسة فعله:
echo 1. فك ضغط الملف.
echo 2. تشغيل ملف (setup-school-hub.bat) مرة واحدة.
echo 3. الضغط على أيقونة "منظومة مدرسة النخبة" على سطح المكتب.
echo =====================================================================
echo.
pause
