import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
     type?: "primary" | "secondary" | "dangerous";
     children: React.ReactNode;
     url?: string;
     classes?: string;
     loading?: boolean;
     disabled?: boolean;
     square?: boolean;
     actionType?: "submit" | "reset" | "button" | undefined;
     [key: string]: any;
}

export default function Button({ type = "primary", children, url, classes = "", loading, disabled, square = false, actionType, ...rest }: Properties) {
     let colors;

     switch (type) {
          case "primary":
               colors = "bg-white border-white text-black hover:text-white active:text-white hover:bg-white/25 active:bg-white/40";
               break;
          case "secondary":
               colors = "bg-transparent border-white text-white hover:bg-white/25 active:bg-white/40";
               break;
          case "dangerous":
               colors = "bg-red-700 border-red-700 text-white hover:bg-red-700/30 active:bg-red-700/45";
               break;
     }
     
     const classList = `${square ? "p-3.25" : "px-4.25 py-3.25"} text-sm uppercase leading-none text-center font-semibold ${colors} border rounded-sm select-none cursor-pointer duration-150 ${classes} active:scale-96`;
     
     return url?.length ? (
          <Link href={url} className={classList} {...rest} draggable={false}>
               {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
          </Link>
     ) : (
               <button className={classList} disabled={disabled || loading} type={actionType} {...rest}>
               {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
          </button>
     );
}