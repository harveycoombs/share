import Popup from "@/app/components/common/popup";
import Button from "../button";
import Field from "../field";

interface Properties {
    onClose: () => void;
}

export default function LoginForm({ onClose }: Properties) {
    return (
        <Popup title="Sign In" onClose={onClose}>
            <form className="">
                <Field type="email" placeholder="Email Address" classes="block w-full" />
                <Button classes="block w-full">Continue</Button>
            </form>
        </Popup>
    );
}