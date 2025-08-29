"use client";
import { useState, useCallback, useContext, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import Settings from "@/app/components/popups/Settings";
import { UserContext } from "@/app/context/UserContext";

export default function Header() {
    const path = usePathname();
    const user = useContext(UserContext);

    if (user && (path == "/login" || path == "/register")) {
        window.location.href = "/";
    }

    if (path == "/login" || path == "/register" || path.startsWith("/verify")) return null;

    const [menuIsVisible, setMenuVisibility] = useState<boolean>(false);
    const [settingsAreVisible, setSettingsVisibility] = useState<boolean>(false);

    const logout = useCallback(async () => {
        await fetch("/api/user/session", { method: "DELETE" });
        window.location.reload();
    }, []);

    const avatarLabel = useMemo(() => `${user?.name} (You)`, [user]);
    const logoClassList = useMemo(() => !user ? "max-sm:hidden" : "", [user]);

    return (
        <>
            <header className="p-3.5 flex justify-between select-none">
                <div className={`cursor-pointer duration-150 hover:opacity-80 active:opacity-60 ${logoClassList}`} onClick={() => window.location.href = "/"}><Logo width={30} height={30} className="block" /></div>

                {user ? (
                    <nav className="relative">
                        <Image 
                            src={`${user.avatar || "/images/default.jpg"}?t=${new Date().getTime()}`}
                            alt={avatarLabel} 
                            title={avatarLabel}
                            width={32} 
                            height={32}
                            className="inline-block align-middle rounded object-cover aspect-square"
                            draggable={false}
                        />

                        <div className="inline-block align-middle text-xl text-slate-400/60 leading-none translate-y-px ml-5 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85" onClick={() => setMenuVisibility(!menuIsVisible)}>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </div>

                        <div className={`${menuIsVisible ? "block" : "hidden"} absolute top-[120%] right-0 overflow-hidden bg-white border border-slate-200/50 rounded-lg shadow-lg w-38`}>
                            <HeaderSubMenuItem first={true} onClick={() => setSettingsVisibility(true)}>Settings</HeaderSubMenuItem>
                            <HeaderSubMenuItem red={true} onClick={logout}>Log out</HeaderSubMenuItem>
                        </div>
                    </nav>
                ) : (
                    <nav className="max-sm:flex max-sm:w-full max-sm:gap-1">
                        <Button url="/login" classes="inline-block align-middle max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2">Sign In</Button>
                        <Button url="/register" classes="inline-block align-middle ml-2.5 max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2" color="gray">Sign Up</Button>
                    </nav>
                )}
            </header>

            {settingsAreVisible && user && <Settings onClose={() => setSettingsVisibility(false)} />}
        </>
    );
}

function HeaderSubMenuItem({ url = "", children, classes = "", first = false, red = false, ...rest }: any) {
    const color = red ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-slate-100/50";
    const classList = `block px-2.5 py-1.75 text-[0.8rem] font-medium ${first ? "" : "border-t border-slate-200/50"} ${color} duration-150 cursor-pointer${classes}`;

    return url.length ? <Link href={url} target="_blank" rel="noopener noreferrer" className={classList} {...rest}>{children}</Link> : <div className={classList} {...rest}>{children}</div>;
}