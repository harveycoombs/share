import Link from "next/link";

export default function Button(props: any) {
    let classes = "bg-blue-600 text-white text-xs font-semibold pt-2.5 pb-2.5 pl-4 pr-4 rounded duration-150 hover:bg-blue-700 active:bg-blue-800";
    let customClasses = props.classes?.length ? ` ${props.classes.join(" ")}` : "";

    return (
        props.url?.length ? <Link href={props.url} className={classes + customClasses}>{props.text.toUpperCase()}</Link> : <button className={classes + customClasses} onClick={props.click ?? ""}>{props.text.toUpperCase()}</button>
    );
}