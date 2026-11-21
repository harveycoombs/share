interface Properties {
    children: React.ReactNode;
    classes?: string;
    [key: string]: any;
}

export default function Menu({ children, classes = "", ...rest }: Properties) {
    return <select className={`p-2.5 text-sm text-gray-700 font-medium rounded-xl bg-gray-50 border border-gray-200 leading-none duration-150 focus:outline-hidden focus:border-blue-500 dark:bg-zinc-900 dark:border-zinc-700/65 dark:text-white ${classes}`} {...rest}>{children}</select>;
}