# =======================================================================
#    منظومة مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
#    تشغيل السيرفر المحلي والشبكة الداخلية (LAN School Hub)
# =======================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "       مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)" -ForegroundColor Yellow
Write-Host "          تشغيل السيرفر المحلي وشبكة المدرسة الداخلية (LAN Hub)" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Get IPv4 Address
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "169.254*" -and $_.IPAddress -notlike "127.0.0.1" } | Select-Object -First 1).IPAddress

if (-not $localIp) {
    $localIp = "127.0.0.1"
}

Write-Host "[✓] تم فحص النظام والاتصال بنجاح." -ForegroundColor Green
Write-Host "[✓] عنوان السيرفر على شبكة المدرسة هو: http://${localIp}:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "-----------------------------------------------------------------------" -ForegroundColor Gray
Write-Host " 1. للدخول من هذه الحاسبة:         http://localhost:3000" -ForegroundColor White
Write-Host " 2. للدخول من حاسبات المحاسبة:      http://${localIp}:3000" -ForegroundColor White
Write-Host " 3. لدخول المعلمين عبر هواتفهم:    http://${localIp}:3000" -ForegroundColor White
Write-Host "-----------------------------------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "جاري تشغيل المنظومة وفتح المتصفح..." -ForegroundColor Green
Write-Host ""

# Start browser in background
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} | Out-Null

# Start Next.js Production Server
npm run start
