"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Notice from "@/app/components/common/Notice";

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
                "Share-Upload-Password": password,
                
            }
        });

        switch (response.status) {
            case 200:
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                setURL(url);
                break;
            case 401:
                setError("Invalid password");
                break;
            default:
                setError("Something went wrong");
        }

        setLoading(false);
    }

    useEffect(() => {
        if (!url.length) return;
        window.open(url, "_blank");
    }, [url]);

    return (
        <main className="min-h-[calc(100vh-117px)] grid place-items-center max-sm:min-h-[calc(100vh-135px)]">
            <section className="w-fit select-none">
                <div className="w-fit mx-auto">
                    <div className="w-fit mx-auto max-sm:scale-90"><Logo width={288} height={56} className="dark:fill-white" /></div>
                    <h2 className="block font-medium text-slate-400 my-4 text-center max-sm:text-sm">The no-frills file sharing service</h2>
                </div>

                {error.length ? (
                    <Notice color="red">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {error}
                    </Notice>
                ) : url.length ? (
                    <Notice color="green">
                        <FontAwesomeIcon icon={faUnlock} className="mr-1" />
                        Unlocked
                    </Notice>
                ) : (
                    <Notice color="amber">
                        <FontAwesomeIcon icon={faLock} className="mr-1" />
                        This upload is Password-Protected
                    </Notice>
                )}

                {!url.length && (
                    <div className="w-75.5 mx-auto mt-4">
                        <Label classes="block w-full text-left mb-1">Password</Label>
                        <Field type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} classes="block w-full" />

                        <Button classes="block w-full mt-2.5" loading={loading} onClick={checkPassword}>Unlock</Button>
                    </div>
                )}
            </section>
        </main>
    );
}