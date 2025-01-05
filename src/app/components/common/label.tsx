interface Properties {
    children: React.ReactNode;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Label({ children, classes, error, warning, ...rest }: Properties) {
    return <label className={`text-xs font-medium text-slate-400/70 select-none mb-1${classes?.length ? " " + classes : ""}`} {...rest}>{children}</label>;
}