"use client";
import { useEffect } from "react";

export default function Advertisement() {
    useEffect(() => {
        (window as any).atOptions = {
            key : process.env.NEXT_PUBLIC_ADSTERRA_KEY ?? "",
            format : "iframe",
            width : parseInt(process.env.NEXT_PUBLIC_ADSTERRA_WIDTH ?? "0"),
            height : parseInt(process.env.NEXT_PUBLIC_ADSTERRA_HEIGHT ?? "0"),
            params : {}
        };

        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = `https://www.highperformanceformat.com/${process.env.NEXT_PUBLIC_ADSTERRA_KEY ?? ""}/invoke.js`;
        script.async = true;

        const container = document.querySelector("#adv");

        container?.appendChild(script);

        return () => {
            container?.removeChild(script);
        }
    }, []);

    return <div id="adv" style={{ width: parseInt(process.env.NEXT_PUBLIC_ADSTERRA_WIDTH ?? "0"), height: parseInt(process.env.NEXT_PUBLIC_ADSTERRA_HEIGHT ?? "0") }}></div>;
}