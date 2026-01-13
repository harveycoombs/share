"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import VerificationForm from "./form";
import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";

export default function Verify() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";

    useEffect(() => {
        if (!email.length) return;

        window.history.replaceState({}, "", "/verify");
    }, [email]);

    return (
        <main className="min-h-[calc(100vh-101px)] grid place-items-center">
            <section className="w-75.5 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Verify Your Account</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Enter the code sent to your email</div>

                {email.length ? <VerificationForm email={email} /> : (
                    <div>
                        <strong className="block mx-auto text-center font-semibold text-red-500">Missing Email Address</strong>
                        <Button classes="block w-full mt-5" url="/">Home</Button>
                    </div>
                )}
            </section>
        </main>
    );
}