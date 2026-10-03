import type { Metadata } from "next";

import "./global.css";

// font
import { Inter, Noto_Sans_KR } from "next/font/google";
import { QueryProvider } from "./providers/QueryProvider";
import { cn } from "@/shared/lib/tailwind/utils";
import { ErrorPopupProvider } from "@/shared/lib/error-popup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Echo | 나의 영어 연습",
  description: "말하고, 반복하고, 나의 영어로 만드는 연습 공간",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={cn(inter.variable, notoSansKR.variable, "font-sans")}>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <ErrorPopupProvider />
      </body>
    </html>
  );
}
