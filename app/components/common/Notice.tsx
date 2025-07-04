interface Properties {
    children: React.ReactNode;
    classes?: string;
    color?: string;
    [key: string]: any;
}

export default function Notice({ children, classes = "", color = "", ...rest }: Properties) {
    let colors = "";

    switch (color) {
        case "red":
            colors = "text-red-500 bg-gradient-to-b from-red-100/75 to-red-100 border border-red-200";
            break;
        case "green":
            colors = "text-green-500 bg-gradient-to-b from-green-100/75 to-green-100 border border-green-200";
            break;
        case "amber":
            colors = "text-amber-500 bg-gradient-to-b from-amber-100/75 to-amber-100 border border-amber-200";
            break;
        default:
            colors = "text-indigo-500 bg-gradient-to-b from-indigo-100/75 to-indigo-100 border border-indigo-200";
            break;
    }

    return <div className={`w-full rounded-md ${colors} p-2 leading-none font-medium text-sm ${classes.length ? classes : ""}`} {...rest}>{children}</div>;
}