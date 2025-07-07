import Popup from "@/app/components/common/Popup";
import Label from "@/app/components/common/Label";
import Menu from "@/app/components/common/Menu";
import Button from "@/app/components/common/Button";

interface Properties {
    onClose: () => void;
}

export default function PlatformSettings({ onClose }: Properties) {
    return (
        <Popup title="Settings" onClose={onClose}>
            <div className="w-64">
                <Label classes="block w-full mt-2.75 mb-0.5">Language</Label>
                <Menu classes="block w-full">
                    <option value="en">English (EN)</option>
                    <option value="de">German (DE)</option>
                    <option value="de">Italian (IT)</option>
                </Menu>

                <Button classes="block w-full mt-2.75">Save</Button>
            </div>
        </Popup>
    );
}