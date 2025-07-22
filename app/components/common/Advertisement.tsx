"use client";
import { useEffect } from "react";

export default function Advertisement() {
    useEffect(() => {
        (window as any).atOptions = {
            key : "d1be5247516a9c83605c1b02ccd06b64",
            format : "iframe",
            height : 50,
            width : 320,
            params : {}
        };

        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "https://www.highperformanceformat.com/d1be5247516a9c83605c1b02ccd06b64/invoke.js";
        script.async = true;

        const container = document.querySelector("#adv");

        container?.appendChild(script);

        return () => {
            container?.removeChild(script);
        }
    }, []);

    return <div id="adv" style={{ width: 320, height: 50 }}></div>;
}