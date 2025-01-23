import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Popup({ title, onClose, children, ...rest }: Properties) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60" id="popup" onMouseDown={(e: any) => {if (e.target.matches("#popup")) onClose() }}>
            <div className="bg-white p-3 rounded-lg" {...rest}>
                <div className="flex justify-between items-center leading-none pb-1.5">
                    <strong className="text-sm font-medium text-slate-400/60 select-none">{title}</strong>
                    <div className="text-slate-400/60 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></div>
                </div>
                {children}
            </div>
        </div>
    );
}