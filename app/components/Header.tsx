"use client";
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence } from "motion/react";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import Settings from "@/app/components/popups/Settings";
import { UserContext } from "@/app/context/UserContext";

export default function Header() {
    const path = usePathname();
    const user = useContext(UserContext);

    if (user && (path == "/signin" || path == "/signup")) {
        window.location.href = "/";
    }

    if (path == "/signin" || path == "/signup" || path.startsWith("/verify") || path == "/authenticate") return null;

    const [menuIsVisible, setMenuVisibility] = useState<boolean>(false);
    const [settingsAreVisible, setSettingsVisibility] = useState<boolean>(false);

    const logout = useCallback(async () => {
        await fetch("/api/user/session", { method: "DELETE" });
        window.location.reload();
    }, []);

    const avatarLabel = useMemo(() => `${user?.name} (You)`, [user]);

    useEffect(() => {
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    const closeMenu = useCallback((e: any) => {
        if (e.target.matches("#menu, #menu *, #menu_button, #menu_button *")) return;
        setMenuVisibility(false);
    }, []);
    
    return (
        <motion.header
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, type: "spring", damping: 10, stiffness: 100 }}
            className="p-5 select-none"
        >
            <div className="p-2.5 border border-slate-300 rounded-2xl flex justify-between items-center">
                <Link href="/" className={`cursor-pointer duration-150 hover:opacity-80 active:opacity-60 ${!user ? "max-sm:hidden" : ""}`} draggable={false}>
                    <Logo width={68} height={30} className="block" />
                </Link>

                <nav className="flex items-center gap-2.5 relative">
                    {user ? (
                        <>
                            <Image 
                                src={user.avatar || "/images/default.jpg"}
                                alt={avatarLabel} 
                                title={avatarLabel}
                                width={39} 
                                height={39}
                                className="inline-block align-middle rounded-xl object-cover aspect-square"
                                draggable={false}
                            />

                            <div id="menu_button" className="inline-block align-middle text-xl text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85" onClick={() => setMenuVisibility(!menuIsVisible)}>
                                <FontAwesomeIcon icon={faEllipsis} />
                            </div>

                            <AnimatePresence>
                                {menuIsVisible && (
                                    <div id="menu" className="absolute top-[120%] right-0 overflow-hidden bg-white border border-slate-200/50 rounded-lg shadow-lg w-38">
                                        <HeaderSubMenuItem first={true} onClick={() => setSettingsVisibility(true)}>Settings</HeaderSubMenuItem>
                                        <HeaderSubMenuItem red={true} onClick={logout}>Log out</HeaderSubMenuItem>
                                    </div>
                                )}
                            </AnimatePresence>                        
                        </>
                    ) : (
                        <>
                            <Button url="/signin" classes="inline-block align-middle max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2">Sign In</Button>
                            <Button url="/signup" classes="inline-block align-middle max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2" color="gray">Sign Up</Button>
                        </>
                    )}
                </nav>
            </div>

            <AnimatePresence>
                {settingsAreVisible && user && <Settings onClose={() => setSettingsVisibility(false)} />}
            </AnimatePresence>
        </motion.header>
    );
}

function HeaderSubMenuItem({ url = "", children, classes = "", first = false, red = false, ...rest }: any) {
    const color = red ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-slate-100/50";
    const classList = `block px-2.5 py-1.75 text-[0.8rem] font-medium ${first ? "" : "border-t border-slate-200/50"} ${color} duration-150 cursor-pointer${classes}`;

    return url.length ? <Link href={url} target="_blank" rel="noopener noreferrer" className={classList} {...rest}>{children}</Link> : <div className={classList} {...rest}>{children}</div>;
}