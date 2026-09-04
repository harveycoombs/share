import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface Properties {
     type?: "primary" | "secondary";
     children: React.ReactNode;
     url?: string;
     classes?: string;
     loading?: boolean;
     disabled?: boolean;
     square?: boolean;
     [key: string]: any;
}

export default function Button({ type = "primary", children, url, classes = "", loading, disabled, square = false, ...rest }: Properties) {
     let colors;

     switch (type) {
          case "primary":
               colors = "bg-white text-black hover:text-white active:text-white";
               break;
          case "secondary":
               colors = "bg-transparent text-white";
               break;
     }
     
     const classList = `${square ? "p-3.25" : "px-4.25 py-3.25"} text-sm uppercase leading-none font-semibold ${colors} border border-white rounded-sm select-none cursor-pointer duration-150 ${classes} hover:bg-white/25 active:bg-white/40 active:scale-96`;
     
     return url?.length ? (
          <Link href={url} className={classList} {...rest} draggable={false}>
               {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
          </Link>
     ) : (
          <button className={classList} disabled={disabled || loading} {...rest}>
               {loading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : children}
          </button>
     );
}