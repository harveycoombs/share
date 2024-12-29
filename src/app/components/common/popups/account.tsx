import Popup from "@/app/components/common/popup";

interface Properties {
    user: any;
    onClose: () => void;
}

export default function AccountSettings({ user, onClose }: Properties) {
    return (
        <Popup title="Account Settings" onClose={onClose}>
            to-do
        </Popup>
    );
}