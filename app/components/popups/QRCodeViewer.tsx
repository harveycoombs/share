import Image from "next/image";

import Popup from "@/app/components/common/Popup";

interface Properties {
    code: string;
    onClose: () => void;
}

export default function QRCodeViewer({ code, onClose }: Properties) {
    return (
        <Popup title="QR Code" onClose={onClose}>
            <Image src={code} alt="QR Code" width={500} height={500} className="block select-none" draggable={false} />
        </Popup>
    );
}