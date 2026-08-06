import type { Metadata } from "next";
import "./globals.css";
import "./pwa.css";

export const metadata: Metadata = {
  title: "바다어때 | 부산 해수욕장 안전 체크",
  description: "부산 해수욕장의 모래 온도, 파도, 그늘, 해파리 정보를 한눈에 확인하세요.",
  manifest: "/manifest.webmanifest",
  applicationName: "바다어때",
  appleWebApp: { capable: true, title: "바다어때", statusBarStyle: "default" },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
