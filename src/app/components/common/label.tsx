interface Properties {
    children: React.ReactNode;
    classes?: string;
}

export default function Label({ children, classes }: Properties) {
    return <label className={`text-xs font-medium select-none text-slate-400/70${classes?.length ? " " + classes : ""}`}>{children}</label>;
}