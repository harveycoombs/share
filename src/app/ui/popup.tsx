import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Properties {
    children: React.ReactNode;
    title: string;
    close: any;
}

export default function Popup({ children, title, close }: Properties) {
    return (
        <div className="fixed inset-0 grid place-items-center bg-slate-800 bg-opacity-80">
            <div className="p-3 bg-slate-50 rounded min-w-96">
                <div className="flex justify-between items-center text-sm">
                    <strong className="font-bold text-slate-800">{title.toUpperCase()}</strong>
                    <div className="text-lg cursor-pointer duration-150 hover:text-red-500" onClick={close}><FontAwesomeIcon icon={faXmark} /></div>
                </div>{children}
            </div>
        </div>
    );
}