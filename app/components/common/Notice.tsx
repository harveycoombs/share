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
            colors = "from-red-300/50 to-red-300/25 text-red-500 border-red-400/85 dark:from-red-400/30 dark:to-red-400/15 dark:text-red-200 dark:border-red-300/30";
            break;
        case "green":
            colors = "from-green-300/50 to-green-300/25 text-green-500 border-green-300 dark:from-green-400/30 dark:to-green-400/15 dark:text-green-200 dark:border-green-300/30";
            break;
        case "amber":
            colors = "from-amber-300/50 to-amber-300/25 text-amber-600 border-amber-400/75 dark:from-amber-400/30 dark:to-amber-400/15 dark:text-amber-200 dark:border-amber-300/30";
            break;
        case "blue":
            colors = "from-blue-300/50 to-blue-300/25 text-blue-500/75 border-blue-300 dark:from-blue-500/30 dark:to-blue-500/15 dark:text-blue-300 dark:border-blue-300/25";
            break;
    }

    return (
        <div className={`w-full rounded-lg ${colors} bg-linear-to-t p-2 leading-none font-semibold dark:font-medium border text-sm flex items-center gap-1.25 ${classes.length ? classes : ""}`} {...rest}>
            <FontAwesomeIcon icon={icon} />
            {children}
        </div>
    );
}