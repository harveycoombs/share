import Link from "next/link";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    url?: string;
    click?: any;
}

export default function Button({ children, classes, url, click }: Properties) {
    let classList = `bg-blue-600 text-white text-xs font-semibold pt-2.5 pb-2.5 pl-4 pr-4 rounded select-none duration-150 hover:bg-blue-700 active:bg-blue-800${classes?.length ? " " + classes : ""}`;

    return (
        url?.length ? <Link href={url} className={classList}>{children}</Link> : <button className={classList} onClick={click}>{children}</button>
    );
}