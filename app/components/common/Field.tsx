interface Properties {
    type?: string;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Field({ type, classes, error, warning, ...rest }: Properties) {
    const classList = `p-2.25 text-[0.8rem] text-slate-800 font-normal rounded-xl bg-slate-50 border border-slate-200 leading-none duration-150 focus:outline-hidden focus:border-blue-500 ${classes?.length && " " + classes}`;
    
    return <input type={type ?? "text"} className={classList} {...rest} />;
}