interface Properties {
    type?: string;
    classes?: string;
    warning?: boolean;
    error?: boolean;
    [key: string]: any;
}

export default function Field({ type, classes, warning, error, ...rest }: Properties) {
     return (
          <input
               type={type ?? "text"}
               className={`p-2.75 text-sm leading-none border border-white/25 bg-white/10 rounded-sm select-none cursor-pointer duration-150 focus:outline-none focus:border-white ${classes}`}
               {...rest}
          />
     );
}