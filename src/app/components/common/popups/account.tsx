import Popup from "@/app/components/common/popup";

interface Properties {
    userid: number;
    onClose: () => void;
}

export default function AccountSettings({ userid, onClose }: Properties) {
    return (
        <Popup title="Account Settings" onClose={onClose}>
            <div className="flex gap-3 w-500">
                <div className="w-28"></div>
                <div>b</div>
            </div>
        </Popup>
    );
}

function SidebarItem({ title, ...rest }: any) {
    return <div className="px-2 py-1 rounded text-sm leading-none font-medium" {...rest}>{title}</div>;
}