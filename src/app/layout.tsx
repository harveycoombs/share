import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";

const inter = Inter({
    weight: ["400", "500", "600", "700", "900"],
    subsets: ["latin"]
});

export const metadata: Metadata = {
    title: "Share · Harvey Coombs",
    description: "An easy-to-use file sharing platform."
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} h-screen bg-white text-slate-800 dark:bg-gray-900 dark:text-white`}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}