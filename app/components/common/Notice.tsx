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
            colors = "bg-red-100/75 text-red-400";
            break;
        case "green":
            colors = "bg-green-100/75 text-green-400";
            break;
        case "amber":
            colors = "bg-amber-100/75 text-amber-400";
            break;
        default:
            colors = "bg-indigo-100 text-indigo-400";
    }

    return <div className={`w-full rounded-md ${colors} p-2 leading-none font-medium text-sm ${classes.length ? classes : ""}`} {...rest}>{children}</div>;
}