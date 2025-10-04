import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Properties {
    icon: any;
    classes?: string;
    url?: string;
    [key: string]: any;
}

export default function SSOButton({ icon, classes = "", url = "", ...rest }: Properties) {
    const classList = `p-2 rounded-md text-slate-600 font-medium bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-lg text-center select-none cursor-pointer duration-150 transition-transform active:translate-y-0.5 ${classes}`;
    return url.length ? <Link href={url} className={classList} {...rest}><FontAwesomeIcon icon={icon} /></Link> : <div className={classList} {...rest}><FontAwesomeIcon icon={icon} /></div>;
}