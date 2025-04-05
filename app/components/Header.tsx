"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faRightFromBracket, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

import Settings from "@/app/components/common/popups/Settings";
import Button from "./common/Button";

export default function Header() {
    const path = usePathname();
    if (path == "/login" || path == "/register") return null;

    const [user, setUser] = useState<any>(null);
    const [settingsAreVisible, setSettingsVisibility] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user/session");
            
            if (!response.ok) {
                setUser(null);
                return;
            }

            const json = await response.json();
            setUser(json.user);
        })();
    }, []);

    async function logout() {
        await fetch("/api/user/session", { method: "DELETE" });
        window.location.reload();
    }

    return (
        <>
            <header className="p-3.5 flex justify-between select-none">
                <div className="cursor-pointer duration-150 hover:opacity-80 active:opacity-60" onClick={() => window.location.href = "/"}><Image src="/images/icon.png" alt="Share" width={28} height={28} /></div>

                {user ? <nav>
                    <div className="w-[30px] h-[30px] inline-grid place-items-center rounded-full text-xs font-medium bg-blue-100 text-blue-500" title={`Signed in as ${user.first_name} ${user.last_name}`}>{(user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase()}</div>
                    <HeaderIcon icon={faGear} title="Settings" onClick={() => setSettingsVisibility(true)} />
                    <HeaderIcon icon={faRightFromBracket} title="Log out" onClick={logout} />
                </nav> : <nav>
                    <Button url="/login" classes="inline-block align-middle">Sign In</Button>
                    <Button url="/register" classes="inline-block align-middle ml-2" transparent={true}>Sign Up</Button>
                </nav>}
            </header>
            {settingsAreVisible && user && <Settings onClose={() => setSettingsVisibility(false)} />}
        </>
    );
}

function HeaderIcon({ icon, title, url, ...rest }: any) {
    const classList = "inline-block align-middle text-lg text-slate-400/60 leading-none translate-y-px ml-5 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85";
    return url?.length ? <Link href={url} title={title} className={classList} {...rest}><FontAwesomeIcon icon={icon} /></Link> : <div title={title} className={classList} {...rest}><FontAwesomeIcon icon={icon} /></div>;
}