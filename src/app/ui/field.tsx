interface Properties {
    type?: string;
    classes?: string;
    [key: string]: any;
}

export default function Field({ type, placeholder, classes, ...rest }: Properties) {
    let classList = `bg-slate-200 bg-opacity-70 text-slate-800 text-sm pt-2.5 pb-2.5 pl-4 pr-4 rounded duration-150 focus:outline-blue-600${classes?.length ? " " + classes : ""}`;

    return (
        <input type={type ?? "text"} className={classList} {...rest} />
    );
}