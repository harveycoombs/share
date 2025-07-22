"use client";
import { useEffect } from "react";

export default function Advertisement() {
    useEffect(() => {
        (window as any).atOptions = {
            key : "8ebd9c6e4a6ef00a29109f43bd5d2c32",
            format : "iframe",
            height : 60,
            width : 468,
            params : {}
        };

        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "https://www.highperformanceformat.com/8ebd9c6e4a6ef00a29109f43bd5d2c32/invoke.js";
        script.async = true;

        const container = document.querySelector("#adv");

        container?.appendChild(script);

        return () => {
            container?.removeChild(script);
        }
    }, []);

    return <div id="adv" style={{ width: 468, height: 60 }}></div>;
}