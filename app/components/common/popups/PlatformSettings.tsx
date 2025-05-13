import Popup from "../Popup";

interface Properties {
    onClose: () => void;
}

export default function PlatformSettings({ onClose }: Properties) {
    return (
        <Popup title="Settings" onClose={onClose}>
            to-do
        </Popup>
    );
}