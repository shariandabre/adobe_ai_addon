import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import ShimmerText from "./ShimmerText";


export default function Thought({ isThinking, thinkingTime, thinkingMessage = null, final = [] }) {
    const [dropdownActive, setDropdownActive] = useState(false);
    const toggleDropdown = () => setDropdownActive(!dropdownActive);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        setMsg(thinkingMessage || "Thinking...");
    }, [thinkingMessage]);

    return (
        <div className="w-full flex flex-col pt-2 px-3 text-sm">
            {isThinking ? (
                <ShimmerText text={msg} />
            ) : (
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center justify-between w-full transition-opacity duration-300 hover:opacity-80"
                    >
                        <span>Thought for {thinkingTime} seconds</span>
                        <FaChevronRight
                            className={`w-3 h-3 transform transition-transform duration-300 ${
                                dropdownActive ? "rotate-90" : "rotate-0"
                            }`}
                        />
                    </button>

                    <div
                        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                            dropdownActive ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                        }`}
                    >
                        <div className="py-2 px-3 bg-gray-100 rounded-md">
                            {final.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {final.map((thought, idx) => (
                                        <li key={idx}>{thought}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-600 italic">No detailed thoughts available.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
