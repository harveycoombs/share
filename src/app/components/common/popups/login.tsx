import Popup from "@/app/components/common/popup";

interface Properties {
    onClose: () => void;
}

export default function LoginForm({ onClose }: Properties) {
    return (
        <Popup title="Sign In" onClose={onClose}>
            to-do
        </Popup>
    );
}