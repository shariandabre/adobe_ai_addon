import React from "react";

export default function ShimmerText({ text, duration = 2.8, fadeInDuration = 1 }) {
    return (
        <>
            <style>{`
                @keyframes shimmerText {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes fadeInText {
                    0%   { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>

            <span
                key={text}
                className="inline-block"
                style={{
                    background: "linear-gradient(135deg,#f7f7f7 0%,#000000 50%,#f7f7f7 100%)",
                    backgroundSize: "200% 100%",
                    animation: `shimmerText ${duration}s linear infinite, fadeInText ${fadeInDuration}s ease-out forwards`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent"
                }}
            >
                {text}
            </span>
        </>
    );
}