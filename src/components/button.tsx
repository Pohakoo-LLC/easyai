import { ReactElement } from "react";
import clsx from "clsx";

type buttonProps = {
    className?: string;
    onClick?: () => void;
    enabled?: boolean;
    variation?: number;
    children?: ReactElement;
}

export default function Button({className="", onClick, children, enabled=true, variation=1}:buttonProps) {
    return (
        <div 
            className={clsx(
                "rounded-md text-white duration-200 ease-in-out border border-gray-500 cursor-pointer",
                variation === 1 ? (enabled ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-800")
                :variation === 2 && (enabled ? "bg-blue-800 hover:bg-blue-700" : "bg-blue-800"),
                className
            )}
            onClick={enabled ? onClick : ()=>{}}
        >
            {children}
        </div>
    )
}