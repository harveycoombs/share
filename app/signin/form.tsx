"use client";
import { useState } from "react";
import { motion } from "motion/react";


import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Notice from "@/app/components/common/Notice";

export default function LoginForm() {
     const [email, setEmailAddress] = useState<string>("");
     const [password, setPassword] = useState<string>("");
     
     const [loading, setLoading] = useState<boolean>(false);
     const [success, setSuccess] = useState<string>("");
     const [error, setError] = useState<string>("");
     const [warning, setWarning] = useState<string>("");
     const [usingPassword, setUsingPassword] = useState<boolean>(false);
     
     async function login(e?: any) {
          e?.preventDefault();

          setLoading(true);
          setSuccess("");
          setError("");
          setWarning("");
     
          if (!email?.length) {
               setWarning("Missing email address");
               setLoading(false);
               return;
          }
     
          const response = await fetch("/api/user/session", {
               method: "POST",
               body: JSON.stringify({ email, password })
          });
     
          const { usingPassword, error } = await response.json();
     
          setLoading(false);
     
          switch (response.status) {
               case 200:
               case 201:
     			if (!usingPassword) {
     			     setSuccess("A sign-in link has been sent to your email.");
     			     return;
     			}
     
     			window.location.href = "/";
                    break;
               case 400:
               case 401:
               case 403:
                    setWarning(error);
                    break;
               case 404:
                    window.location.href = `/signup?email=${encodeURIComponent(email)}`;
                    break;
               default:
                    setError(error);
                    break;
          }
     }
     
     async function check(e: any) {
     	e.preventDefault();
     	
     	setLoading(true);
          setUsingPassword(false);
     	setSuccess("");
     	setError("");
     	setWarning("");
     
     	if (!email?.length) {
     	     setWarning("Missing email address");
     	     setLoading(false);
     	     return;
     	}
     
     	const response = await fetch(`/api/user/check?email=${encodeURIComponent(email)}`);
     	const { exists, usingPassword } = await response.json();
     
     	if (!response.ok) {
     	     setError("Unable to check email address. Please try again later.");
     		setLoading(false);
     		return;
     	}
     
     	if (!exists) {
     	     window.location.href = `/signup?email=${encodeURIComponent(email)}`;
     		return;
     	}
     
     	setUsingPassword(usingPassword);
      
          if (!usingPassword) {
               setPassword("");
               login();
               return;
          }

          setLoading(false);
     }
     
     return (
          <form className="w-75.5" onSubmit={usingPassword ? login : check}>
               {success.length > 0 && <Notice color="green" classes="mb-5">{success}</Notice>}
               {warning.length > 0 && <Notice color="amber" classes="mb-5">{warning}</Notice>}
               {error.length > 0 && <Notice color="red" classes="mb-5">{error}</Notice>}
     
               <Label classes="block mt-2.5">Email Address</Label>
               <Field type="email" classes="block w-full" readOnly={success.length > 0} onInput={(e: any) => setEmailAddress(e.target.value)} />
     
     		{usingPassword && (
     		     <motion.div
     				initial={{ opacity: 0, height: 0 }}
     				animate={{ opacity: 1, height: "auto" }}
     				transition={{ duration: 0.5, ease: "easeInOut" }}
     			>
                         <Label classes="block mt-2.5">Password</Label>
                         <Field type="password" classes="block w-full" readOnly={success.length > 0} onInput={(e: any) => setPassword(e.target.value)} />				
     			</motion.div>
     		)}
     
               {!success.length && <Button classes="block w-full mt-3" disabled={!email.length} loading={loading}>Continue</Button>}
          </form>
     );
}