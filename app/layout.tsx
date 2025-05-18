import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import packageJson from "@/package.json";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";


const inter = Inter({
    weight: ["400", "500", "600", "700", "900"],
    subsets: ["latin"]
});

const description = "An easy-to-use file sharing platform.";

export const metadata: Metadata = {
    title: `Share · ${packageJson.version}`,
    description: description,
    icons: { icon: "/images/icon.png" },
    themeColor: "#37BFF9",
    openGraph: {
        title: "Share",
        description: description,
        url: "https://share.surf",
        images: [{
            url: "https://share.surf/images/splash.jpg",
            width: 1200,
            height: 630,
            alt: "Share splash image"
        }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Share",
        description: description,
        creator: "@harveycoombs23",
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="apple-touch-icon" sizes="180x180" href="/images/icon.png" />
                <link rel="canonical" href="https://share.surf" />

                <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7873492896986281" crossOrigin="anonymous"></Script>
            </head>

            <body className={`${inter.className} h-screen bg-white text-slate-800 dark:bg-zinc-900 dark:text-white`}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}