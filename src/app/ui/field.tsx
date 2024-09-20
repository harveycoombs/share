export default function Field(props: any) {
    return (
        <input type={props.type ?? "text"} placeholder={props.placeholder} id={props.id} className={["text-xs bg-gray-100 text-gray-900 pt-2 pb-2 pl-4 pr-4 rounded-full duration-150 focus:outline-cyan-500 placeholder:text-gray-300 placeholder:font-medium"].concat(props.classes ?? []).join(" ")} />
    );
}