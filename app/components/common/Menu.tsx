interface Properties {
    children: React.ReactNode;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Menu({ children, classes, error, warning, ...rest }: Properties) {
    const borderColor = error ? "border-red-500" : warning ? "border-amber-500" : "border-slate-300";
    const classList = `p-2.5 text-[0.8rem] text-slate-800 font-normal rounded-lg border ${borderColor} bg-transparent leading-none duration-150 focus:outline-hidden focus:border-indigo-500 ${classes?.length && " " + classes}`;
    
    return <select className={classList} {...rest}>{children}</select>;
}