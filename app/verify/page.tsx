"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import VerificationForm from "./form";
import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";

export default function Verify() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let parameter = new URL(window.location.search).searchParams.get("email") ?? "";

        if (parameter.length) {
            window.history.replaceState({}, "", "/verify");
            setEmail(decodeURI(parameter).trim());
        }

        setLoading(false);
    }, []);

    return (
        <main className="min-h-[calc(100vh-117px)] grid place-items-center">
            <section className="w-75.5 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Verify Your Account</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Enter the code sent to your email</div>

                {email.length ? <VerificationForm email={email} /> : loading ? (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-slate-400/60" />
                    </div>
                ) : (
                    <div>
                        <strong className="block mx-auto text-center font-semibold text-red-500">Missing Email Address</strong>
                        <Button classes="block w-full mt-5" url="/">Home</Button>
                    </div>
                )}
            </section>
        </main>
    );
}