import Popup from "@/app/components/common/Popup";

interface Properties {
    onClose: () => void;
}

export default function AccountPrompt({ onClose }: Properties) {
    return (
        <Popup title="Share Account" onClose={onClose}>
        </Popup>
}