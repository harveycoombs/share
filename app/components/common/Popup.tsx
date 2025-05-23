import { motion } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    classes?: string;
    [key: string]: any;
}

export default function Popup({ title, onClose, children, classes, ...rest }: Properties) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 backdrop-blur-xs dark:bg-zinc-900/60" id="popup" onMouseDown={(e: any) => {if (e.target.matches("#popup")) onClose() }}>
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { duration: 0.15, ease: "easeOut" }}} className={`bg-white p-3 rounded-lg max-w-[90vw] ${classes?.length ? " " + classes : ""} dark:bg-zinc-800`} {...rest}>
                <div className="flex justify-between items-center leading-none pb-1.5">
                    <strong className="text-sm font-medium text-slate-400/60 select-none dark:text-zinc-400/60">{title}</strong>
                    <div className="text-slate-400/60 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 dark:text-zinc-400 dark:hover:text-zinc-400 dark:active:text-zinc-400" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}