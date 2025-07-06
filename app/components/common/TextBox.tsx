interface Properties {
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function TextBox({ classes, error, warning, ...rest }: Properties) {
    const borderColor = error ? "border-red-500" : warning ? "border-amber-500" : "border-slate-300";
    const classList = `p-2.5 text-[0.8rem] rounded-lg border ${borderColor} bg-transparent leading-none duration-150 focus:outline-hidden focus:border-indigo-500 ${classes?.length && " " + classes}`;
    
    return <textarea className={classList} {...rest} />;
}