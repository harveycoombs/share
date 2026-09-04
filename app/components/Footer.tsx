"use client";
import Link from "next/link";

import Panel from "@/app/components/common/Panel";

export default function Footer() {
     return (
          <footer className="fixed w-full bottom-0 z-40 p-4">
               <Panel classes="text-sm font-medium flex justify-between items-center">
                    <div>
                         <span>2021 &ndash; {new Date().getFullYear()}</span>
                         <span className="mx-2 font-black">&middot;</span>
                         <span>Share.surf</span>
                         <span className="mx-2 font-black">&middot;</span>
                         <Link href="https://www.harveycoombs.com" className="hover:underline">Harvey Coombs</Link>
                    </div>

                    <div>
                         <Link href="/documents/privacy-policy.pdf" className="hover:underline">Privacy Policy</Link>
                         <span className="mx-2 font-black">&middot;</span>
                         <Link href="/documents/terms-of-service.pdf" className="hover:underline">Terms of Service</Link>
                         <span className="mx-2 font-black">&middot;</span>
                         <Link href="https://github.com/harveycoombs/share" className="hover:underline">View on GitHub</Link>
                    </div>
               </Panel>
          </footer>
     );
}