export default function Field(props: any) {
    return (
        <input type={props.type ?? "text"} placeholder={props.placeholder} id={props.id} className={["bg-slate-200 bg-opacity-70 text-slate-800 text-sm pt-2.5 pb-2.5 pl-4 pr-4 rounded duration-150 focus:outline-blue-600"].concat(props.classes ?? []).join(" ")} />
    );
}