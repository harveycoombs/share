interface Properties {
    type?: string;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Field({ type, classes, error, warning, ...rest }: Properties) {
    let classList = `px-5 py-2.5 rounded-full text-[0.8rem] border border-slate-300 bg-transparent leading-none duration-150 focus:outline-none focus:border-blue-500 ${classes?.length && " " + classes}`;
    return <input type={type ?? "text"} className={classList} {...rest} />;
}