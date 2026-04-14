
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppInstallScripts } from "@/components/AppInstallScripts";

export const metadata: Metadata = {
  title: "食材庫存小管家",
  description: "紀錄食材庫存、保存期限與食譜建議的手機版小工具",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "食材庫存小管家" }
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <AppInstallScripts />
        {children}
      </body>
    </html>
  );
}
