const os = require("os");
const { spawn, exec } = require("child_process");
const qrcodeTerminal = require("qrcode");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

async function startHub() {
  const ip = getLocalIP();
  const port = process.env.PORT || 3000;
  const loginUrl = `http://${ip}:${port}/login`;
  const adminUrl = `http://localhost:${port}/admin/dashboard`;

  console.clear();
  console.log("\x1b[32m%s\x1b[0m", "================================================================================");
  console.log("\x1b[1m\x1b[36m%s\x1b[0m", "   🏫 سيرفر المدرسة الداخلي - منظومة النخبة لإدارة المدارس (School Local Hub)");
  console.log("\x1b[32m%s\x1b[0m", "================================================================================");
  console.log("");
  console.log(" 🌐 حاسبة الإدارة المركزية (السيرفر المحلي):", `\x1b[33mhttp://localhost:${port}\x1b[0m`);
  console.log(" 📶 رابط شبكة المدرسة الداخلية (Wi-Fi LAN):", `\x1b[32m${loginUrl}\x1b[0m`);
  console.log("");
  console.log("\x1b[35m%s\x1b[0m", " 📱 امسح رمز QR التالي بكاميرا هاتف المعلم للدخول المباشر بدون إنترنت:");
  console.log("");

  try {
    const qrString = await qrcodeTerminal.toString(loginUrl, { type: "terminal", small: true });
    console.log(qrString);
  } catch (e) {
    // Ignore QR terminal render error
  }

  console.log("\x1b[32m%s\x1b[0m", "--------------------------------------------------------------------------------");
  console.log(" 💡 ملاحظة: لا يحتاج المعلمون لإنترنت خارجي، فقط الاتصال بشبكة واي فاي المدرسة!");
  console.log(" ⚠️  اترك هذه الشاشة السوداء مفتوحة أثناء دوام المدرسة.");
  console.log("\x1b[32m%s\x1b[0m", "================================================================================");
  console.log(" 🚀 جاري بدء خادم المدرسة وفتح لوحة التحكم في المتصفح...");
  console.log("");

  // Start Next.js using dev server on 0.0.0.0 for instant hot handling
  const nextCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const nextProcess = spawn(nextCmd, ["next", "dev", "-H", "0.0.0.0", "-p", String(port)], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, HOSTNAME: "0.0.0.0" },
  });

  // Open default browser after 3.5 seconds
  setTimeout(() => {
    const openCmd = process.platform === "win32" ? `start http://localhost:${port}/login` : `open http://localhost:${port}/login`;
    exec(openCmd, (err) => {
      if (err) console.log("تنبيه: يمكنك فتح لوحة التحكم يدوياً عبر المتصفح:", adminUrl);
    });
  }, 4000);

  nextProcess.on("exit", (code) => {
    console.log(`تم إيقاف خادم المدرسة (كود: ${code})`);
  });
}

startHub();
