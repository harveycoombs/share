import Link from "next/link";

export default function Button(props: any) {
    let customClasses = props.classes?.length ? ` ${props.classes.join(" ")}` : "";

    let appearance = (props.alt) ? "bg-cyan-100 text-cyan-500 hover:bg-cyan-200 active:bg-cyan-300" : "bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700";
    let classes = `text-xs font-semibold pt-2 pb-2 pl-4 pr-4 rounded-full cursor-pointer text-center select-none duration-150 ${appearance + customClasses}`;

    return (
        props.url?.length ? <Link href={props.url} className={classes}>{props.text}</Link> : <button id={props.id} className={classes}>{props.text}</button>
    );
}