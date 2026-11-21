interface Properties {
    type?: string;
    classes?: string;
    warning?: boolean;
    error?: boolean;
    [key: string]: any;
}

export default function Field({ type, classes, warning, error, ...rest }: Properties) {
    return <input type={type ?? "text"} className={`p-3 text-sm text-gray-700 font-medium rounded bg-gray-50 border border-gray-200 leading-none duration-150 focus:outline-hidden focus:border-blue-600 ${classes}`} {...rest} />;
}