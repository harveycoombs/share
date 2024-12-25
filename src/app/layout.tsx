import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

const inter = Inter({
    weight: ["400", "500", "600", "700", "900"],
    subsets: ["latin"]
});

const description = "An easy-to-use file sharing platform.";

export const metadata: Metadata = {
    title: `Share.surf · ${process.env.APP_VERSION}`,
    description: description,
    icons: { icon: "/images/icon.png" },
    openGraph: {
        title: "Share.surf",
        description: description,
        url: "https://share.surf",
        images: [{
            url: "https://share.surf/images/splash.jpg",
            width: 1200,
            height: 630,
            alt: "Share.surf splash image"
        }],
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Share.surf",
        description: description,
        creator: "@harveycoombs23"
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} h-screen bg-white text-slate-800`}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}