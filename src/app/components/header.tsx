import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header() {
    let [user, setUser] = useState(null);

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

    return (
        <header className="p-3 flex justify-between items-center">
            <Link href="/"><Image src="/images/logo.png" alt="Share.surf" width={28} height={28} /></Link>
            <nav>
                <HeaderLink title="About" url="/about" />
                <HeaderLink title="Support" url="/support" />
                <HeaderLink title="Premium" url="/premium" />
                {user}
            </nav>
        </header>
    );
}

function HeaderLink({ title, url }: any) {
    return <Link href={url} className="">{title}</Link>;
}

function HeaderIcon({ icon, title, url }: any) {
    return <Link href={url} title={title} className=""><FontAwesomeIcon icon={icon} /></Link>;
}