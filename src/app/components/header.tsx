import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AccountSettings from "@/app/components/common/popups/account";
import LoginForm from "@/app/components/common/popups/login";

export default function Header() {
    let [user, setUser] = useState<any>(null);

    useEffect(() => {
        (async () => {
            let response = await fetch("/api/user/session");
            let json = await response.json();

            if (!response.ok) {
                setUser(null);
                return;
            }

            setUser(json.user);
        })();
    }, []);

    let [accountSettingsAreVisible, setAccountSettingsVisibility] = useState<boolean>(false);
    let [loginFormIsVisible, setLoginFormVisibility] = useState<boolean>(false);

    return (
        <>
            <header className="p-3 flex justify-between items-center">
                <Link href="/"><Image src="/images/logo.png" alt="Share.surf" width={28} height={28} /></Link>
                <nav>
                    <HeaderLink title="About" url="/about" />
                    <HeaderLink title="Support" url="/support" />
                    <HeaderLink title="Premium" url="/premium" />
                    {user ? <HeaderIcon icon="fa-solid fa-user" title={`Signed in as ${user.firstname} ${user.lastname}`} onClick={() => setAccountSettingsVisibility(true)} /> : <HeaderIcon icon="fa-solid fa-user" title="Sign in" onClick={() => setLoginFormVisibility(true)} />}
                </nav>
            </header>
            {accountSettingsAreVisible && <AccountSettings user={user} onClose={() => setAccountSettingsVisibility(false)} />}
            {loginFormIsVisible && <LoginForm onClose={() => setLoginFormVisibility(false)} />}
        </>
    );
}

function HeaderLink({ title, url }: any) {
    return <Link href={url} className="">{title}</Link>;
}

function HeaderIcon({ icon, title, ...rest }: any) {
    return <div title={title} className="" {...rest}><FontAwesomeIcon icon={icon} /></div>;
}