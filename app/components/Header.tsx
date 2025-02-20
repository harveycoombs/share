"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AccountSettings from "@/app/components/common/popups/AccountSettings";
import LoginForm from "@/app/components/common/popups/LoginForm";
import { faGear, faRightFromBracket, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    const [user, setUser] = useState<any>(null);

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

    const [accountSettingsAreVisible, setAccountSettingsVisibility] = useState<boolean>(false);
    const [loginFormIsVisible, setLoginFormVisibility] = useState<boolean>(false);

    return (
        <>
            <header className="p-4 flex justify-between select-none">
                <div className="cursor-pointer duration-150 hover:opacity-80 active:opacity-60" onClick={() => window.location.href = "/"}><Image src="/images/icon.png" alt="Share" width={28} height={28} /></div>
                <nav>
                    <HeaderLink title="Report Issue" url="https://github.com/harveycoombs/share/issues/new" target="_blank" rel="noopener" />
                    {user ? <>
                        <div className="w-[30px] h-[30px] inline-grid place-items-center rounded-full text-xs font-medium bg-blue-100 text-blue-500 mr-5" title={`Signed in as ${user.first_name} ${user.last_name}`} onClick={() => setAccountSettingsVisibility(true)}>{(user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase()}</div>
                        <HeaderIcon icon={faRightFromBracket} title="Sign out" onClick={logout} />
                    </> : <HeaderIcon icon={faRightToBracket} title="Sign in" onClick={() => setLoginFormVisibility(true)} />}
                </nav>
            </header>
            {accountSettingsAreVisible && user && <AccountSettings onClose={() => setAccountSettingsVisibility(false)} />}
            {loginFormIsVisible && <LoginForm onClose={() => setLoginFormVisibility(false)} />}
        </>
    );
}

function HeaderLink({ title, url, ...rest }: any) {
    return <Link href={url} className="inline-block align-middle text-sm font-medium leading-none mr-8 cursor-pointer duration-150 hover:text-slate-500 active:text-slate-400" draggable={false} {...rest}>{title}</Link>;
}

function HeaderIcon({ icon, title, ...rest }: any) {
    return <div title={title} className="inline-block align-middle text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85" {...rest}><FontAwesomeIcon icon={icon} /></div>;
}

// <HeaderIcon icon={faGear} />