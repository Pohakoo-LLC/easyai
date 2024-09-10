import { ReactElement } from "react";
import clsx from "clsx";

type buttonProps = {
    className?: string;
    onClick?: () => void;
    enabled?: boolean;
    variation?: number;
    children?: ReactElement | string;
}

export default function Button({className="", onClick, children, enabled=true, variation=1}:buttonProps) {
    return (
        <div 
            className={clsx(
                "rounded-md duration-200 ease-in-out border cursor-pointer shadow-xl",
                (variation === 1 || variation === 2) && "text-white border-gray-500",
                variation === 1 ? (enabled ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-800") : 
                variation === 2 ? (enabled ? "bg-blue-800 hover:bg-blue-700" : "bg-blue-800") :
                variation === 3 && (enabled ? "border-gray-400 hover:bg-gray-200" : "bg-gray-300 text-gray-500"),
                className
            )}
            onClick={enabled ? onClick : ()=>{}}
            style={{
                userSelect: 'none'
            }}
        >
            {children}
        </div>
    )
}