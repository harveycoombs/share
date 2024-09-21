import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function Popup(props: any) {
    return (
        <div className="fixed inset-0 grid place-items-center bg-slate-800 bg-opacity-80">
            <div className="p-3 bg-slate-50 rounded min-w-96">
                <div className="flex justify-between items-center text-sm">
                    <strong className="font-extrabold text-slate-800">{props.title.toUpperCase()}</strong>
                    <div className="text-lg cursor-pointer duration-150 hover:text-red-500" onClick={props.close}><FontAwesomeIcon icon={faXmark} /></div>
                </div>{props.content ?? ""}
            </div>
        </div>
    );
}