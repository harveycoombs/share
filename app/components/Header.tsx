"use client";
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
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
     
     const [menuIsVisible, setMenuVisibility] = useState<boolean>(false);
     const [settingsAreVisible, setSettingsVisibility] = useState<boolean>(false);
     
     const logout = useCallback(async () => {
          await fetch("/api/user/session", { method: "DELETE" });
          window.location.reload();
     }, []);
     
     const avatarLabel = useMemo(() => `${user?.name} (You)`, [user]);
     
     useEffect(() => {
          document.addEventListener("click", closeMenu);
          return () => document.removeEventListener("click", closeMenu);
     }, []);
     
     const closeMenu = useCallback((e: any) => {
          if (e.target.matches("#menu, #menu *, #menu_button, #menu_button *")) return;
          setMenuVisibility(false);
     }, []);
     
     return (
          <header className="p-4 sticky top-0 z-40 text-white">
               <div className="flex items-center justify-between p-4 backdrop-blur-md border border-white/15 bg-white/5 rounded">
                    <Link href="/" className="uppercase font-semibold leading-none text-2xl select-none">Share.surf</Link>

                    <nav className="flex items-center gap-4">
                         <HeaderLink url="/">Donate</HeaderLink>
                         <HeaderLink url="/">DMCA Takedowns</HeaderLink>
                         <HeaderLink url="/">Report an Issue</HeaderLink>

                         <Button>Sign In</Button>
                         <Button type="secondary">Sign Up</Button>
                    </nav>
               </div>
          </header>
     );
}

function HeaderLink({ url, children }: any) {
     return <Link href={url} className="font-semibold uppercase hover:underline text-sm">{children}</Link>;
}