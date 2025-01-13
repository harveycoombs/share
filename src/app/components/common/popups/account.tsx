import Popup from "@/app/components/common/popup";

interface Properties {
    userid: number;
    onClose: () => void;
}

export default function AccountSettings({ userid, onClose }: Properties) {
    return (
        <Popup title="Account Settings" onClose={onClose}>
            <div className="flex gap-3 w-500">
                <div className="w-28">a</div>
                <div>b</div>
            </div>
        </Popup>
    );
}