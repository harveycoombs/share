interface Properties {
    children: React.ReactNode;
    classes?: string;
    [key: string]: any;
}

export default function Panel({ children, classes = "", ...rest }: Properties) {
    return (
        <div className={`p-3 border border-gray-300 rounded-md dark:text-zinc-500 dark:border-zinc-700 ${classes}`} {...rest}>
            {children}
        </div>
    );
}