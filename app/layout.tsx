import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "바다어때 | 부산 해수욕장 안전 체크",
  description: "부산 해수욕장의 모래 온도, 파도, 그늘, 해파리 정보를 한눈에 확인하세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
