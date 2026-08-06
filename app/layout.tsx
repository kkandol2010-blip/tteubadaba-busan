import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "뜨바다바 | 부산 해수욕장 안전 가이드",
  description: "부산 7개 해수욕장의 모래 온도, 파도, 해파리, 그늘과 햇빛 노출 시간을 한눈에 확인하세요.",
  manifest: "/manifest.webmanifest",
  applicationName: "뜨바다바",
  appleWebApp: { capable: true, title: "뜨바다바", statusBarStyle: "default" },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "뜨바다바 | 부산 해수욕장 안전 가이드",
    description: "뜨거운 바다, 딴 바다로. 부산 7개 해수욕장을 더 안전하게 즐겨요.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "뜨바다바" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
