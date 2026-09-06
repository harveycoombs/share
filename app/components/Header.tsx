"use client";
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { AnimatePresence } from "motion/react";

import { UserContext } from "@/app/context/UserContext";
import Button from "@/app/components/common/Button";
import Settings from "@/app/components/popups/Settings";
import Panel from "@/app/components/common/Panel";

export default function Header() {
     const path = usePathname();
     const user = useContext(UserContext);
     
     if (user && (path.startsWith("/signin") || path == "/signup")) {
          window.location.href = "/";
     }
     
     if (path.startsWith("/signin") || path == "/signup" || path == "/authenticate") return null;

     const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
     
     const logout = useCallback(async () => {
          await fetch("/api/user/session", { method: "DELETE" });
          window.location.reload();
     }, []);

     return (
          <header className="p-4 sticky top-0 z-40 text-white">
               <Panel classes="flex items-center justify-between">
                    <Link href="/" className="uppercase font-semibold leading-none text-2xl select-none duration-150 hover:text-white/75 active:text-white/55 active:scale-97">Share.surf</Link>

                    <nav className="flex items-center gap-4">
                         <HeaderLink classes="text-amber-400">Donate</HeaderLink>
                         <HeaderLink>DMCA Takedowns</HeaderLink>
                         <HeaderLink>Report an Issue</HeaderLink>

                         {user ? (
                              <div
                                   className="text-xl border border-white text-white grid place-items-center w-10.5 h-10.5 rounded select-none cursor-pointer duration-150 hover:bg-white/15 active:bg-white/10 active:scale-96"
                                   title={`Signed in as ${user.name}`}
                                   onClick={() => setSettingsOpen(true)}
                              >
                                   <FontAwesomeIcon icon={faUser} />
                              </div>
                         ) : (
                              <>
                                   <Button url="/signin">Sign In</Button>
                                   <Button url="/signup" type="secondary">Sign Up</Button>
                              </>
                         )}

                    </nav>
               </Panel>

               <AnimatePresence>
                    {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
               </AnimatePresence>
          </header>
     );
}

function HeaderLink({ url = "", children, classes = "", ...rest }: any) {
     const classList = `text-sm font-semibold uppercase cursor-pointer hover:underline ${classes}`;
     return url.length > 0 ? <Link href={url} className={classList} {...rest}>{children}</Link> : <button className={classList} {...rest}>{children}</button>;
}