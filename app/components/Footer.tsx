"use client";
import Link from "next/link";

import Panel from "@/app/components/common/Panel";

export default function Footer() {
     return (
          <footer className="fixed w-full bottom-0 z-30 p-4">
               <Panel classes="text-sm font-medium flex justify-between items-center">
                    <div>
                         <span>2021 &ndash; {new Date().getFullYear()}</span>
                         <span className="mx-2 font-black">&middot;</span>
                         <span>Share.surf</span>
                         <span className="mx-2 font-black">&middot;</span>
                         <FooterLink url="https://www.harveycoombs.com" text="Harvey Coombs" />
                    </div>

                    <div>
                         <FooterLink url="/documents/privacy-policy.pdf" text="Privacy Policy" />
                         <span className="mx-2 font-black">&middot;</span>
                         <FooterLink url="/documents/terms-of-service.pdf" text="Terms of Service" />
                         <span className="mx-2 font-black">&middot;</span>
                         <FooterLink url="https://github.com/harveycoombs/share" text="View on GitHub" />
                    </div>
               </Panel>
          </footer>
     );
}

function FooterLink({ url, text }: any) {
     return <Link href={url} rel="noopener noreferrer" target="_blank" className="hover:underline">{text}</Link>;
}