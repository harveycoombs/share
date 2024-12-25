import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Popup({ title, onClose, children, ...rest }: Properties) {
    return (
        <div>
            <div>
                <div>
                    <strong>{title}</strong>
                    <div onClick={onClose}><FontAwesomeIcon icon={faXmark} /></div>
                </div>
                {children}
            </div>
        </div>
    );
}