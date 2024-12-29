import Link from "next/link";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    transparent?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, classes, transparent, ...rest }: Properties) {
    let appearance = transparent ? "font-semibold hover:bg-slate-50 hover:text-slate-500 active:bg-slate-100 active:text-slate-600" : "font-medium bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700";
    let classList = `px-5 py-3 rounded-full text-[0.8rem] leading-none ${appearance} duration-150 cursor-pointer text-center select-none${classes?.length && " " + classes}`;

    return url?.length ? <Link href={url} className={classList} {...rest}>{children}</Link> : <button className={classList} {...rest}>{children}</button>;
}