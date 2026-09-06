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
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 grid place-items-center max-sm:px-5" id="popup" 
            onMouseDown={(e: any) => {if (e.target.matches("#popup")) onClose() }}
        >
            <motion.div 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.15, ease: "easeOut" }}} 
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.15, ease: "easeOut" }}}
                className={`p-4 backdrop-blur-md border border-white/15 bg-neutral-900/75 rounded ${classes}`} 
                {...rest}
            >
                <div className="flex justify-between items-center leading-none pb-1.5 select-none">
                    <strong className="text-sm font-semibold">{title}</strong>

                    <motion.div 
                        className="text-sm cursor-pointer duration-100 hover:text-red-500 active:text-red-600"
                        onClick={onClose}
                        whileHover={{ 
                            scale: 1.1,
                            rotate: 90,
                            transition: { duration: 0.15, ease: "easeOut" }
                        }}
                        whileTap={{ scale: 0.9, transition: { duration: 0.15, ease: "easeOut" }}}
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