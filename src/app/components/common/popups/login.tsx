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
                <Label>Email Address</Label>
                <Field type="email" classes="block w-full" />
                <Label classes="mt-2.5">Password</Label>
                <Field type="password" classes="block w-full" />
                <Button classes="block w-full mt-2.5">Continue</Button>
                <Button transparent={true} classes="block w-full mt-2.5">Register</Button>
                <div>
                    <Link href="/">Recover Account</Link> &middot; <Link href="/">Report Issue</Link>
                </div>
            </form>
        </Popup>
    );
}