interface Properties {
    children: React.ReactNode;
    classes?: string;
    error?: boolean;
    warning?: boolean;
    [key: string]: any;
}

export default function Label({ children, classes, error, warning, ...rest }: Properties) {
    const textColor = error ? "text-red-500" : warning ? "text-amber-500" : "text-slate-400/70";
    return <label className={`block text-xs font-medium ${textColor} select-none mb-1${classes?.length ? " " + classes : ""}`} {...rest}>{children}</label>;
}