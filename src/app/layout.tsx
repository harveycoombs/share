import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Header from "./ui/header";

const inter = Inter({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Share · Harvey Coombs",
  description: "Written by Harvey Coombs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-slate-300 h-screen`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
