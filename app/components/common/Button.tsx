import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    url?: string;
    small?: boolean;
    classes?: string;
    transparent?: boolean;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, small, classes = "", transparent, color = "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700", loading, disabled, ...rest }: Properties) {
    const appearance = transparent ? "font-semibold hover:bg-slate-50 hover:text-slate-500 active:bg-slate-100 active:text-slate-600 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800/90 dark:hover:text-zinc-400 dark:active:text-zinc-400" : `font-medium text-white ${color}`;
    const classList = `px-5 py-3 rounded-md text-[0.8rem] leading-none ${appearance} duration-150 ${loading ? "" : "cursor-pointer"} text-center select-none${classes.length > 0 && " " + classes} `;

    return url?.length ? <Link href={url} className={classList} {...rest}>{loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}</Link> : <button className={classList} disabled={disabled || loading} {...rest}>{loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}</button>;
}