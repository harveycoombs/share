interface Properties {
    children: React.ReactNode;
    classes?: string;
    color?: "red" | "green" | "amber" | "blue";
    [key: string]: any;
}

export default function Notice({ children, classes = "", color = "blue", ...rest }: Properties) {
    let colors;

    switch (color) {
        case "red":
            colors = "border-red-700/50 text-red-700 bg-red-50";
            break;
        case "green":
            colors = "border-green-700/50 text-green-700 bg-green-50";
            break;
        case "amber":
            colors = "border-amber-700/50 text-amber-700 bg-amber-50";
            break;
        case "blue":
            colors = "border-blue-700/50 text-blue-700 bg-blue-50";
            break;
    }

    return (
        <div className={`w-full rounded-md ${colors} p-2 leading-none border text-sm ${classes}`} {...rest}>
            {children}
        </div>
    );
}