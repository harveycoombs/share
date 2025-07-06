"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

export default function Protected({ params }: any) {
    const [id, setID] = useState<string>("");
    const [url, setURL] = useState<string>("");

    useEffect(() => {
        (async () => {
            const { id } = await params;
            setID(id);
        })();
    }, []);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    async function checkPassword() {
        setLoading(true);

        if (!password.length) {
            setError("Please enter a password.");
            setLoading(false);
            return;
        }

        const response = await fetch(`/uploads/${id}`, {
            headers: {
                "Share-Upload-Password": password
            }
        });

        switch (response.status) {
            case 200:
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setURL(url);
                break;
            case 401:
                setError("Invalid password.");
                break;
            default:
                setError("Something went wrong.");
        }

        setLoading(false);
    }

    return (
        <main className="min-h-[calc(100vh-117px)] grid place-items-center max-sm:min-h-[calc(100vh-135px)]">
            <section className="text-center w-fit select-none">
                <div className="w-fit mx-auto">
                    <div className="w-fit mx-auto max-sm:scale-90"><Logo width={288} height={56} className="dark:fill-white" /></div>
                    <h2 className="block font-medium text-slate-400 mt-4 max-sm:text-sm">The no-frills file sharing service</h2>
                </div>

                {url.length ? <h1 className="text-3xl mt-16 font-medium max-md:px-5 max-sm:text-2xl max-sm:leading-relaxed"><FontAwesomeIcon icon={faUnlock} /></h1> : <h1 className={`text-3xl mt-16 font-medium${error.length ? " text-red-500" : ""} max-md:px-5 max-sm:text-2xl max-sm:leading-relaxed`}>{error.length ? error : <><FontAwesomeIcon icon={faLock} className="text-amber-500" /> This upload is Password-Protected.</>}</h1>}

                {url.length ? <Button classes="block w-68 mx-auto mt-8" url={url} download={url.substring(url.lastIndexOf("/") + 1)}>Download</Button> : <div className="w-68 mx-auto mt-8">
                    <Label classes="block w-full text-left mb-1">Password</Label>
                    <Field type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} classes="block w-full" />

                    <Button classes="block w-full mt-2.5" loading={loading} onClick={checkPassword}>Unlock</Button>
                </div>}
            </section>
        </main>
    );
}