import React, { useState, useEffect, useRef } from "react";

export default function AgentChatBubble({ message, charsPerSecond = 100 }) {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        setDisplayedText("");
        indexRef.current = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);

        const interval = 1000 / charsPerSecond;

        intervalRef.current = setInterval(() => {
            setDisplayedText((prev) => {
                const nextIndex = indexRef.current + 1;
                indexRef.current = nextIndex;
                if (nextIndex >= message.length) {
                    clearInterval(intervalRef.current);
                    return message;
                }
                return message.slice(0, nextIndex);
            });
        }, interval);

        return () => clearInterval(intervalRef.current);
    }, [message, charsPerSecond]);

    return (
        <div className="w-full py-3 flex justify-start">
            <div className="flex w-[250px] rounded-[12px] px-3 pb-3 text-sm text-black">
                {displayedText}
            </div>
        </div>
    );
}