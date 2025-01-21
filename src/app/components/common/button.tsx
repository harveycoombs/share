import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    url?: string;
    classes?: string;
    transparent?: boolean;
    loading?: boolean;
    disabled?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, classes, transparent, loading, disabled, ...rest }: Properties) {
    const appearance = transparent ? "font-semibold hover:bg-slate-50 hover:text-slate-500 active:bg-slate-100 active:text-slate-600" : "font-medium bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700";
    const classList = `px-5 py-3 rounded-full text-[0.8rem] leading-none ${appearance} duration-150 ${loading ? "" : "cursor-pointer"} text-center select-none${classes?.length && " " + classes}`;

    return url?.length ? <Link href={url} className={classList} {...rest}>{loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}</Link> : <button className={classList} disabled={disabled || loading} {...rest}>{loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}</button>;
}