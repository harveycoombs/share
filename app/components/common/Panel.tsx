interface Properties {
    children: React.ReactNode;
    classes?: string;
    [key: string]: any;
}

export default function Panel({ children, classes = "", ...rest }: Properties) {
    return (
        <div className={`p-2.5 border border-slate-300 rounded-2xl dark:text-zinc-500 dark:border-zinc-700 ${classes}`} {...rest}>
            {children}
        </div>
    );
}