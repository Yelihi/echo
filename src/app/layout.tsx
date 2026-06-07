import type { Metadata } from "next";

import "./globals.css";

// font
import { Noto_Sans_KR } from "next/font/google";
import { QueryProvider } from "./providers/QueryProvider";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "english-speaking-practice",
  description: "FSD(Feature-Sliced Design) 기반 Next.js 프로젝트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKR.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
