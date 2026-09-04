interface Properties {
    children: React.ReactNode;
    classes?: string;
    [key: string]: any;
}

export default function Panel({ children, classes = "", ...rest }: Properties) {
    return (
        <div className={`p-4 backdrop-blur-md border border-white/15 bg-white/5 rounded ${classes}`} {...rest}>
            {children}
        </div>
    );
}