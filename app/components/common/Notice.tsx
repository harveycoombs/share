import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    classes?: string;
    color?: "red" | "green" | "amber";
    icon?: any;
    [key: string]: any;
}

export default function Notice({ children, classes = "", color, icon = faInfoCircle, ...rest }: Properties) {
     let colors;
     
     switch (color) {
          case "red":
               colors = "bg-red-500/15 text-red-400 border-red-400 font-semibold";
               break;
          case "green":
               colors = "bg-emerald-500/15 text-emerald-400 border-emerald-400 font-semibold";
               break;
          case "amber":
               colors = "bg-amber-500/15 text-amber-400 border-amber-400 font-semibold";
               break;
     }
     
     return (
          <div className={`w-full rounded-lg ${colors} px-2 py-2.25 leading-none border text-sm flex items-center gap-1.25 ${classes}`} {...rest}>
               <FontAwesomeIcon icon={icon} />
               {children}
          </div>
     );
}