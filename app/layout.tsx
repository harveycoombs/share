import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import { cookies } from "next/headers";

import packageJson from "@/package.json";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import UserProvider from "@/app/context/UserContext";
import { authenticate } from "@/lib/jwt";

const chakraPetch = Chakra_Petch({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"]
});

const description = "The no-frills file sharing service.";

export const metadata: Metadata = {
    title: `Share · ${packageJson.version}`,
    description: description,
    icons: { icon: "/images/icon.png" },
    openGraph: {
        title: "Share",
        description: description,
        url: "https://www.share.surf",
        images: [{
            url: "https://www.share.surf/images/splash.jpg?v=1",
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
        creator: "",
    }
};

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="#2B7FFF" />

                <link rel="apple-touch-icon" sizes="180x180" href="/images/icon.png" />
                <link rel="canonical" href="https://www.share.surf" />
            </head>

            <body className={`${chakraPetch.className} antialiased h-screen uppercase bg-white text-white/65 overflow-x-hidden`}>
                <UserProvider user={user}>
                    <Header />
                    {children}
                    <Footer />
                </UserProvider>
            </body>
        </html>
    );
}