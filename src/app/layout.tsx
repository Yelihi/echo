import type { Metadata } from "next";

import "./globals.css";

// font
import { Noto_Sans_KR, Geist } from "next/font/google";
import { QueryProvider } from "./providers/QueryProvider";
import { cn } from "@/shared/lib/tailwind/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="ko" className={cn(notoSansKR.variable, "font-sans", geist.variable)}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
