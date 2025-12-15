import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    url?: string;
    square?: boolean;
    classes?: string;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, square, classes = "", color = "", loading, disabled, ...rest }: Properties) {
    let appearance = "";

    switch (color) {
        case "red":
            appearance = "bg-red-500 text-white font-semibold hover:bg-red-600 active:bg-red-700 active:scale-97";
            break;
        case "gray":
            appearance = "bg-slate-100 text-slate-500 font-semibold hover:bg-slate-200 active:bg-slate-300/80 active:scale-97";
            break;
        default:
            appearance = "bg-blue-500 text-white font-medium hover:bg-blue-600 active:bg-blue-700 active:scale-97";
            break;
    }

    const classList = `${square ? "p-3" : "px-4.5 py-3.25"} rounded-xl text-[0.8rem] leading-none ${appearance} duration-150 ${loading ? "" : "cursor-pointer"} text-center select-none ${classes}`;

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