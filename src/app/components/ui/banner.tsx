import { useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    classes?: string;
}

export default function Banner({ children, classes }: Properties) {
    let banner = useRef<HTMLDivElement>(null);

    function closeBanner() {
        if (!banner?.current) return;
        banner.current.remove();
    }

    let classList = `relative p-1.5 text-sm font-medium text-center bg-blue-100 text-blue-600 max-lg:text-xs${classes?.length ? " " + classes : ""}`;

    return (
        <div className={classList} ref={banner}>{children}<div className="absolute right-3 top-0 translate-y-px text-lg select-none cursor-pointer hover:text-blue-400" onClick={closeBanner}><FontAwesomeIcon icon={faXmark} /></div></div>
    );
}