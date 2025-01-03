interface Properties {
    children: React.ReactNode;
    classes?: string;
}

export default function Label({ children, classes }: Properties) {
    return <label className={`text-xs font-medium text-slate-400/70 select-none mb-1${classes?.length ? " " + classes : ""}`}>{children}</label>;
}