interface Properties {
    type?: string;
    small?: boolean;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Field({ type, small, classes, error, warning, ...rest }: Properties) {
    const borderColor = error ? "border-red-500" : warning ? "border-amber-500" : "border-slate-300";
    const classList = `px-5 py-2.5 rounded-md text-[0.8rem] border ${borderColor} bg-transparent leading-none duration-150 focus:outline-hidden focus:border-blue-500 ${classes?.length && " " + classes}`;
    
    return <input type={type ?? "text"} className={classList} {...rest} />;
}