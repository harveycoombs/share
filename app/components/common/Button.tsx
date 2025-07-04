import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    url?: string;
    small?: boolean;
    classes?: string;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, small, classes = "", color = "", loading, disabled, ...rest }: Properties) {
    let appearance = "";

    switch (color) {
        case "red":
            appearance = "text-white font-medium bg-gradient-to-b from-red-500 to-red-600 border border-red-700 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800";
            break;
        case "gray":
            appearance = "text-slate-600 font-medium bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 hover:from-slate-100 hover:to-slate-200 active:from-slate-200 active:to-slate-300";
            break;
        default:
            appearance = "text-white font-medium bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-700 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800";
            break;
    }

    const classList = `px-4.5 py-3 rounded-lg text-[0.8rem] leading-none ${appearance} duration-150 ${loading ? "" : "cursor-pointer"} text-center select-none ${classes}`;

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