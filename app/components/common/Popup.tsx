import { motion } from "motion/react";

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
        <motion.div 
            initial={{ backgroundColor: "color-mix(in oklab,var(--color-slate-900)0%,transparent)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "color-mix(in oklab,var(--color-slate-900)60%,transparent)", backdropFilter: "blur(4px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 grid place-items-center" id="popup" 
            onMouseDown={(e: any) => {if (e.target.matches("#popup")) onClose() }}
        >
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { duration: 0.15, ease: "easeOut" }}} className={`bg-white p-3 rounded-lg${classes?.length ? " " + classes : ""}`} {...rest}>
                <div className="flex justify-between items-center leading-none pb-1.5">
                    <strong className="text-sm font-medium text-slate-400/60 select-none">{title}</strong>

                    <motion.div 
                        className="text-slate-400/60 cursor-pointer duration-100 hover:text-red-500 active:text-red-600"
                        onClick={onClose}
                        whileHover={{ 
                            scale: 1.1,
                            rotate: 90,
                            transition: { duration: 0.15 }
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </motion.div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}