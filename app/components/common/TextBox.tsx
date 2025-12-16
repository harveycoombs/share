interface Properties {
    classes?: string;
    [key: string]: any;
}

export default function TextBox({ classes = "", ...rest }: Properties) {
    return <textarea className={`p-2.5 text-[0.8rem] text-slate-800 font-normal rounded-xl bg-slate-50 border border-slate-200 leading-none duration-150 focus:outline-hidden focus:border-blue-500 dark:bg-zinc-900 dark:border-zinc-700/65 ${classes}`} {...rest} />;
}