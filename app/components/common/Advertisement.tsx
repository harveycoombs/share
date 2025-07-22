import { useEffect } from "react";

export default function Advertisement() {
    useEffect(() => {
        (window as any).atOptions = {
            key: "e764adcc0b5e6389c4608bb865f0b9c5",
            format: "iframe",
            height: 250,
            width: 300,
            params: {}
        };

        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "//www.highperformanceformat.com/e764adcc0b5e6389c4608bb865f0b9c5/invoke.js";
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    return <div id="advcont" style={{ width: 300, height: 250 }}></div>;
}