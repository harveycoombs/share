import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    url?: string;
    padding?: string;
    classes?: string;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, padding = "", classes = "", color = "", loading, disabled, ...rest }: Properties) {
    let appearance = "";

    switch (color) {
        case "red":
            appearance = "bg-red-500 text-white text-shadow-red-700 font-semibold hover:bg-red-600 active:bg-red-700";
            break;
        case "gray":
            appearance = "bg-transparent border-blue-600 text-blue-600 font-medium hover:bg-blue-600/15 active:bg-blue-600/25";
            break;
        default:
            appearance = "bg-blue-600 border-blue-700 text-white font-medium hover:bg-blue-700 active:bg-blue-800";
            break;
    }

    const classList = `${padding || "px-4.75 py-3.5"} rounded border text-sm leading-none ${appearance} duration-150 ${loading ? "" : "cursor-pointer"} text-center select-none active:scale-96
 ${classes}`;

    return url?.length ? (
        <Link href={url} className={classList} {...rest} draggable={false}>
            {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
        </Link>
    ) : (
        <button className={classList} disabled={disabled || loading} {...rest}>
            {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
        </button>
    );
}