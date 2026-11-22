"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";

import Logo from "@/app/components/common/Logo";
import Panel from "@/app/components/common/Panel";
import Button from "@/app/components/common/Button";
import LoginForm from "@/app/signin/form";

export default function Login() {
     return (
          <main className="min-h-[calc(100vh-101px)] grid place-items-center">
               <section>
                    <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60">
                         <Logo width={240} height={34} />
                    </Link>
          
                    <strong className="block font-semibold text-gray-900 text-xl text-center mt-2 select-none">Welcome Back</strong>
                    <p className="font-medium text-center select-none mb-7">Sign in using the form below</p>
     
                    <Panel>
                         <LoginForm />

                         <div className="text-sm text-center text-gray-400 select-none mt-5 dark:text-zinc-500">
                              Don&apos;t have an account?<Link href="/signup" className="text-blue-600 font-semibold ml-1.5 hover:underline">Sign Up</Link>
                         </div>
               
                         <div className="text-sm text-center text-gray-400 select-none mt-2.5 dark:text-zinc-500">
                              Can&apos;t sign in?<Link href="/recover" className="text-blue-600 font-semibold ml-1.5 hover:underline">Recover Account</Link>
                         </div>
                    
                         <div className="relative border-b border-gray-400/40 text-gray-400/60 text-xs font-medium select-none my-6">
                              <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5 dark:bg-zinc-950">OR</span>
                         </div>
          
                         <div className="grid grid-cols-2 gap-2">
              	               <Button color="gray" padding="p-3.25" url="https://discord.com/oauth2/authorize?client_id=1394762759232819400&response_type=code&redirect_uri=https%3A%2F%2Fshare.surf%2Fapi%2Fsso%2Fdiscord&scope=identify+email">
              	                    <FontAwesomeIcon icon={faDiscord} className="text-base" />
              	               </Button>
              	
              	               <Button color="gray" padding="p-3.25" title="Currently Unavailable" disabled={true}>
              	                    <FontAwesomeIcon icon={faGoogle} className="text-base" />
              	               </Button>
                         </div>
                    </Panel>
               </section>
          </main> 
     );
}