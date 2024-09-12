import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import Button from "./button";
import { ReactElement } from "react";
import clsx from "clsx";

type Props = {
    buttonContent: ReactElement|string;
    children?: ReactElement;
    parentScrollOffset?: [number, number];
}

export default function FAIPopover({buttonContent, children, parentScrollOffset}:Props) {
    return (
        <Popover>
            <PopoverButton className="w-fit flex">
                {buttonContent}
            </PopoverButton>
            <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
            >
                <PopoverPanel 
                    className="absolute z-10 w-fit text-black bg-white rounded p-1 space-y-1 shadow my-2"
                    style={{
                        transform:
                            parentScrollOffset ? 
                            `translate(${
                                -parentScrollOffset[0]
                            }px, ${
                                -parentScrollOffset[1]
                            }px)` 
                            : "test"
                    }}>
                    {children}
                </PopoverPanel>
            </Transition>
        </Popover>
    )
}