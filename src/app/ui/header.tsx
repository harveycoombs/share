import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faBug } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Header(props: any) {
    return (
        <header className="flex justify-between items-center p-4">
            <strong className="text-sm font-bold">WRITTEN IN <span className="text-slate-800">RUST</span> BY <a href="https://harveycoombs.com/" target="_blank" className="text-slate-800 decoration-2 hover:underline">HARVEY COOMBS</a></strong>
            <div className="text-sm font-bold">UPLOADS OLDER THAN 30 DAYS ARE DELETED &middot; 5GB MAXIMUM UPLOAD SIZE</div>
            <nav>
                <HeaderNavigationItem title="View Upload History" icon={faClockRotateLeft} />
                <HeaderNavigationItem url="mailto:contact@harveycoombs.com" title="Report an Issue" icon={faBug} />
                <HeaderNavigationItem url="https://github.com/harveycoombs/share" title="View on GitHub" icon={faGithub} />
            </nav>
        </header>

    );
}

function HeaderNavigationItem(props: any) {
    let classes = "inline-block align-middle text-xl ml-4 duration-150 cursor-pointer hover:text-slate-400 active:text-slate-500";

    return (
        props.url?.length ? <Link href={props.url} target="_blank" className={classes} title={props.title} draggable="false"><FontAwesomeIcon icon={props.icon} /></Link> : <div className={classes} draggable="false"><FontAwesomeIcon icon={props.icon} /></div>
    );
}