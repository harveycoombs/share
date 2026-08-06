"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { AnimatePresence } from "motion/react";

import packageJson from "@/package.json";
import IssueForm from "@/app/components/popups/IssueForm";
import DCMAForm from "@/app/components/popups/DCMAForm";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
     const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
     const [issueFormOpen, setIssueFormOpen] = useState<boolean>(false);
     const [DMCAFormOpen, setDMCAFormOpen] = useState<boolean>(false);
     
     return (
          <footer className="p-5 select-none overflow-hidden max-sm:overflow-visible">
               <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.3, type: "spring", damping: 10, stiffness: 100, delay: 0.15 }}
                    className="flex justify-between items-center text-slate-400 text-sm font-medium max-lg:flex-col max-lg:gap-2"
               >
                    <FooterPanel classes="max-sm:w-full max-sm:flex max-sm:justify-between max-sm:items-center relative">
                         <div className="h-9.75 flex items-center">
                              2021 &ndash; {new Date().getFullYear()}
                              <span className="mx-1">&middot;</span>
                              <span title="Formerly cynohost.com" className="mr-1">Share</span>
                              <Link href={`https://github.com/harveycoombs/share/releases/tag/${packageJson.version}`}>{packageJson.version}</Link>
                              <span className="mx-1">&middot;</span>
                              <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" className="hover:underline" draggable={false}>Harvey Coombs</Link>
                         </div>

                         <AnimatePresence>
                              {mobileMenuOpen && (
                                   <div className="p-5 border border-slate-300 rounded-2xl absolute bottom-[calc(100%+20px)] right-0 backdrop-blur bg-white/10">
                                        <MobileFooterLink url="https://buymeacoffee.com/harveycoombs" text="Donate" classes="text-amber-500 text-shadow-md text-shadow-amber-200 dark:text-shadow-none pt-0" />
                                        <MobileFooterLink url="/documents/privacy-policy.pdf" text="Privacy Policy" />
                                        <MobileFooterLink url="/documents/terms-of-service.pdf" text="Terms of Service" />
                                        
                                        <div className="py-1 hover:underline cursor-pointer" onClick={() => setDMCAFormOpen(true)} draggable={false}>DMCA Takedowns</div>
                                        <div className="py-1 hover:underline cursor-pointer" onClick={() => setIssueFormOpen(true)} draggable={false}>Report an Issue</div>
                                        
                                        <div className="flex gap-2 pt-1">
                                             <FooterIcon icon={faDiscord} title="GitHub" url="https://discord.gg/6yKZ6vmMyv" />
                                             <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
                                        </div>
                                   </div>
                              )}
                         </AnimatePresence>

                         <button className="sm:hidden block leading-none duration-200 cursor-pointer active:opacity-60 active:scale-94" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                              <FontAwesomeIcon icon={faBars} className="block text-2xl" />
                         </button>
                    </FooterPanel>
     
                    <FooterPanel classes="max-sm:hidden">
                         <div className="h-9.75 flex items-center gap-4 max-sm:gap-3">
                              <Link href="https://buymeacoffee.com/harveycoombs" target="_blank" rel="noopener" draggable={false} className="text-amber-500 text-shadow-md text-shadow-amber-200 hover:underline dark:text-shadow-none">Donate</Link>
                              <Link href="/documents/privacy-policy.pdf" className="hover:underline" draggable={false}>Privacy Policy</Link>
                              <Link href="/documents/terms-of-service.pdf" className="hover:underline" draggable={false}>Terms of Service</Link>
                              <div className="hover:underline cursor-pointer" onClick={() => setDMCAFormOpen(true)} draggable={false}>DMCA Takedowns</div>
                              <div className="hover:underline cursor-pointer" onClick={() => setIssueFormOpen(true)} draggable={false}>Report an Issue</div>
                              <FooterIcon icon={faDiscord} title="GitHub" url="https://discord.gg/6yKZ6vmMyv" />
                              <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
                         </div>
                    </FooterPanel>
               </motion.div>
     
               <AnimatePresence>
                    {DMCAFormOpen && <DCMAForm onClose={() => setDMCAFormOpen(false)} />}
               </AnimatePresence>
     
               <AnimatePresence>
                    {issueFormOpen && <IssueForm onClose={() => setIssueFormOpen(false)} />}
               </AnimatePresence>
          </footer>
     );
}

function FooterPanel({ children, classes = "" }: any) {
     return <div className={`py-2.5 px-4.5 border border-slate-300 rounded-2xl dark:text-zinc-500 dark:border-zinc-700 backdrop-blur bg-white/10 ${classes}`}>{children}</div>;
}

function FooterIcon({ icon, title, url, classes = "" }: any) {
     return <Link href={url} target="_blank" rel="noopener" title={title} draggable={false} className={`text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 dark:text-zinc-500 dark:hover:text-zinc-300 dark:active:text-zinc-400 max-sm:block max-sm:text-xl ${classes?.length ? " " + classes : ""}`}><FontAwesomeIcon icon={icon} /></Link>
}

function MobileFooterLink({ url, text, classes = "" }: any) {
     return <Link href={url} target="_blank" rel="noopener" draggable={false} className={`block py-1 hover:underline ${classes}`}>{text}</Link>;
}