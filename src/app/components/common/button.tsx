import Link from "next/link";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    transparent?: boolean;
    [key: string]: any;
}

export default function Button({ children, url, classes, transparent, ...rest }: Properties) {
    let appearance = transparent ? "" : "";
    let classList = `${appearance} ${classes}`;

    return url?.length ? <Link href={url} className={classList} {...rest}>{children}</Link> : <button className={classList} {...rest}>{children}</button>;
}