import os from "os";
import QRCode from "qrcode";

export interface LocalNetworkInfo {
  ipAddress: string;
  port: number;
  localUrl: string;
  loginUrl: string;
  hostname: string;
  qrCodeDataUrl: string;
}

export function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Find IPv4, not internal/loopback
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

export async function getLocalNetworkInfo(port = 3000): Promise<LocalNetworkInfo> {
  const ipAddress = getLocalIPAddress();
  const hostname = os.hostname();
  const localUrl = `http://${ipAddress}:${port}`;
  const loginUrl = `${localUrl}/login`;

  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(loginUrl, {
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate network QR code:", err);
  }

  return {
    ipAddress,
    port,
    localUrl,
    loginUrl,
    hostname,
    qrCodeDataUrl,
  };
}
