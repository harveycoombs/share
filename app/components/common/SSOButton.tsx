import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SSOButton({ icon, classes = "", ...rest }: any) {
    return (
        <div className={`p-2 rounded-md bg-slate-100 text-slate-500 text-lg text-center select-none cursor-pointer duration-150 ${classes}`} {...rest}>
            <FontAwesomeIcon icon={icon} className="duration-150" />
        </div>
    );
}