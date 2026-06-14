"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

import Logo from "@/app/components/common/Logo";
import RegistrationForm from "@/app/signup/form";

export default function Register() {
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const email = params.get("email") ?? "";

        setEmail(email);
    });

    return (
        <main className="min-h-[calc(100vh-101px)] grid place-items-center">
            <section className="w-75.5 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Get More out of Share</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Sign up using the form below</div>

                email: {email}<br/>

                <RegistrationForm initialEmail={email} />
            </section>
        </main>
    );
}