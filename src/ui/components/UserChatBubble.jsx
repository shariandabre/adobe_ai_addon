import React from "react";
import { useState } from "react";

export default function UserChatBubble({message}) {
    return (
        <div className={"w-full py-3 flex justify-end"}>
            <div className={"flex bg-white w-[200px] rounded-[12px] p-3 text-sm text-black border-[1px] border-gray-200"}>
                {message}
            </div>
        </div>

    );
}