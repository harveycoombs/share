import Link from "next/link";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    url?: string;
    transparent?: boolean;
    large?: boolean;
    [key: string]: any;
}

export default function Button({ children, classes, url, transparent, large, ...rest }: Properties) {
    let appearance = transparent ? "bg-transparent text-slate-400/60 font-semibold hover:bg-slate-100/60 hover:text-slate-400 dark:text-slate-400/75 hover:dark:bg-slate-800/60" : "bg-sky-400 text-white font-medium hover:bg-sky-500 active:bg-sky-600";
    let classList = `text-[0.813rem] ${large ? "py-2.5 px-5" : "py-2 px-4"} rounded-md select-none duration-150 ${appearance} ${classes?.length ? classes : ""}`;

    return (
        url?.length ? <Link href={url} className={classList}>{children}</Link> : <button className={classList} {...rest}>{children}</button>
    );
}