import Link from "next/link";

import Popup from "@/app/components/common/popup";
import Button from "@/app/components/common/button";
import Field from "@/app/components/common/field";
import Label from "@/app/components/common/label";

interface Properties {
    onClose: () => void;
}

export default function LoginForm({ onClose }: Properties) {
    return (
        <Popup title="Sign In" onClose={onClose}>
            <form className="w-72">
                <strong className="block font-semibold text-lg text-center mt-2 select-none">Welcome Back</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none">Sign in using the form below</div>
                <Label classes="block mt-5">Email Address</Label>
                <Field type="email" classes="block w-full" />
                <Label classes="block mt-2.5">Password</Label>
                <Field type="password" classes="block w-full" />
                <Button classes="block w-full mt-2.5">Continue</Button>
                <Button transparent={true} classes="block w-full mt-2.5">Register</Button>
                <div className="text-sm text-slate-400/60 text-center select-none mt-2.5">
                    <Link href="/recovery" className="hover:underline">Recover Account</Link> &middot; <Link href="https://github.com/harveycoombs/share/issues/new" className="hover:underline">Report Issue</Link>
                </div>
            </form>
        </Popup>
    );
}