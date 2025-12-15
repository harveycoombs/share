import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    color?: "red" | "green" | "amber" | "blue" | undefined;
    icon?: IconProp;
    [key: string]: any;
}

export default function Notice({ children, classes = "", color = "blue", icon = faInfoCircle, ...rest }: Properties) {
    let colors;

    switch (color) {
        case "red":
            colors = "bg-red-100 text-red-500";
            break;
        case "green":
            colors = "bg-green-100 text-green-500";
            break;
        case "amber":
            colors = "bg-amber-100 text-amber-500";
            break;
        case "blue":
            colors = "bg-blue-100 text-blue-500";
            break;
    }

    return (
        <div className={`w-full rounded-lg ${colors} p-2 leading-none font-semibold text-sm flex items-center gap-1.25 ${classes.length ? classes : ""}`} {...rest}>
            <FontAwesomeIcon icon={icon} />
            {children}
        </div>
    );
}