interface Properties {
    type?: string;
    classes?: string;
    warning?: boolean;
    error?: boolean;
    [key: string]: any;
}

export default function Field({ type, classes, warning, error, ...rest }: Properties) {
    return <input type={type ?? "text"} className={`p-2.25 text-[0.8rem] text-slate-800 font-normal rounded-xl bg-slate-50 border border-slate-200 leading-none duration-150 focus:outline-hidden focus:border-blue-500 dark:bg-zinc-900 dark:border-zinc-700/65 dark:text-white ${classes}`} {...rest} />;
}