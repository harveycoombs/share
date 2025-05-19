interface Properties {
    children: React.ReactNode;
    small?: boolean;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Menu({ children, small, classes, error, warning, ...rest }: Properties) {
    const borderColor = error ? "border-red-500" : warning ? "border-amber-500" : "border-slate-300 dark:border-zinc-600";
    const classList = `${small ? "p-1.75 text-xs" : "p-2.5 text-[0.8rem]"} rounded-md border ${borderColor} bg-transparent leading-none duration-150 focus:outline-hidden focus:border-indigo-500 ${classes?.length && " " + classes}`;
    
    return <select className={classList} {...rest}>{children}</select>;
}