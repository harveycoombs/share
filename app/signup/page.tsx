"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

import Logo from "@/app/components/common/Logo";
import Panel from "@/app/components/common/Panel";
import RegistrationForm from "@/app/signup/form";

export default function Register() {
     const [email, setEmail] = useState<string>("");
     
     useEffect(() => {
          const params = new URLSearchParams(window.location.search);
          const emailAddress = params.get("email") ?? "";
     
          setEmail(emailAddress);
     
          if (emailAddress.length) {
               window.history.replaceState({}, "", "/signup");
          }
     }, []);
     
     return (
          <main className="min-h-[calc(100vh-101px)] grid place-items-center">
               <section>
                    <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60">
                         <Logo width={240} height={34} />
                    </Link>
     
                    <strong className="block font-semibold text-gray-900 text-xl text-center mt-2 select-none">Get More out of Share</strong>
                    <p className="font-medium text-center select-none mb-7">Sign up using the form below</p>
     
                    <Panel>
                         <RegistrationForm initialEmail={email} />
                    </Panel>
               </section>
          </main>
     );
}