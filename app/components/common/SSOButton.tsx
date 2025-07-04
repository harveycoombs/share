import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SSOButton({ icon, classes = "", ...rest }: any) {
    return (
        <div className={`p-2 rounded-md text-slate-600 font-medium bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-lg text-center select-none cursor-pointer duration-150 transition-transform active:translate-y-0.5 ${classes}`} {...rest}>
            <FontAwesomeIcon icon={icon} />
        </div>
    );
}