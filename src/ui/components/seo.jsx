import React, { useState, useEffect } from "react";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const SEOManager = () => {
    const [selectedElementInfo, setSelectedElementInfo] = useState("No content selected");
    const [userInputPrompt, setUserInputPrompt] = useState("");
    const [suggestedFileName, setSuggestedFileName] = useState("");
    const [suggestedAltText, setSuggestedAltText] = useState("");
    const [suggestedKeywords, setSuggestedKeywords] = useState("");
    const [suggestedTips, setSuggestedTips] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isSuggestBtnDisabled, setIsSuggestBtnDisabled] = useState(true);
    const [isCopyButtonsDisabled, setIsCopyButtonsDisabled] = useState(true);

    const shrinkToDataURL = async (blob) => {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 128;
        canvas.getContext("2d").drawImage(bitmap, 0, 0, 128, 128);
        return canvas.toDataURL("image/jpeg", 0.5);
    };

    const showCopiedStatus = () => {
        setStatusMessage("Copied!");
        setTimeout(() => setStatusMessage(""), 2000);
    };

    const handleCopy = async (textToCopy, fieldRef) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            showCopiedStatus();
        } catch (err) {
            console.warn("Clipboard write failed, falling back to manual selection");
            // Fallback: auto-select text for user to press Ctrl+C
            if (fieldRef && fieldRef.current) {
                fieldRef.current.removeAttribute('readonly');
                fieldRef.current.select();
                fieldRef.current.setSelectionRange(0, 99999); // For mobile devices
                fieldRef.current.setAttribute('readonly', '');
            }
            alert("Text selected. Please press Ctrl+C to copy manually.");
        }
    };

    const handlePreviewCanvas = async () => {
        setSelectedElementInfo("Loading preview…");
        const { app, constants } = addOnUISdk;
        try {
            const [rend] = await app.document.createRenditions(
                {
                    range: constants.Range.currentPage,
                    format: constants.RenditionFormat.png,
                },
                constants.RenditionIntent.preview
            );
            const url = URL.createObjectURL(rend.blob);
            setSelectedElementInfo(`<img src="${url}" alt="Canvas preview" />`);
            setIsSuggestBtnDisabled(false);
        } catch (err) {
            setSelectedElementInfo("Preview failed.");
            console.error(err);
        }
    };

    const handleGetSuggestions = async () => {
        setLoading(true);
        setIsSuggestBtnDisabled(true);
        setStatusMessage("");
        setIsCopyButtonsDisabled(true);

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = selectedElementInfo;
            const imgEl = tempDiv.querySelector("img");

            if (!imgEl) throw new Error("No preview image available. Please load content first.");

            const resp = await fetch(imgEl.src);
            if (!resp.ok) throw new Error("Failed to fetch image for analysis.");

            const dataURL = await shrinkToDataURL(await resp.blob());
            const userCtx = userInputPrompt.trim() || "No extra context";

            const apiRes = await fetch(
                "https://my-addon.vercel.app/api/generate",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dataURL, prompt: userCtx }),
                }
            );

            const { fileName, altText, keywords, tips, error } = await apiRes.json();
            if (error) throw new Error(error);

            setSuggestedFileName(fileName || "");
            setSuggestedAltText(altText || "");
            setSuggestedKeywords(keywords || "");
            setSuggestedTips(tips || "");

            setIsCopyButtonsDisabled(false);
            setStatusMessage("Suggestions ready!");
        } catch (err) {
            console.error(err);
            setStatusMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
            setIsSuggestBtnDisabled(false);
        }
    };

    // Refs for direct DOM manipulation for copy fallback
    const fileNameRef = React.useRef(null);
    const altTextRef = React.useRef(null);
    const keywordsRef = React.useRef(null);
    const tipsRef = React.useRef(null);

    return (
        <div
            className="container mx-auto max-w-sm bg-white rounded-lg p-6 space-y-6"
            style={{ fontFamily: "Inter, sans-serif" }}
        >
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
                SEO Suggestions
            </h2>

            <div>
                <button
                    id="previewCanvasBtn"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium mb-3"
                    onClick={handlePreviewCanvas}
                >
                    Load Content (mandatory)
                </button>
                <div
                    id="selectedElementInfo"
                    className="p-3 bg-gray-100 rounded-md text-gray-600 text-sm italic break-words"
                    dangerouslySetInnerHTML={{ __html: selectedElementInfo }}
                ></div>
            </div>

            <div>
                <label
                    htmlFor="userInputPrompt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Provide additional context (Optional):
                </label>
                <textarea
                    id="userInputPrompt"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none text-sm"
                    placeholder="e.g., 'Focus on a professional audience', 'Highlight the vibrant colors', 'This is for a blog post about travel'"
                    value={userInputPrompt}
                    onChange={(e) => setUserInputPrompt(e.target.value)}
                ></textarea>
            </div>
            <button
                id="suggestMetadataBtn"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                onClick={handleGetSuggestions}
                disabled={isSuggestBtnDisabled}
            >
                Get Suggestions
            </button>

            <div
                id="loadingIndicator"
                className={`text-center text-blue-600 text-sm ${loading ? "" : "hidden"
                    }`}
            >
                <svg
                    className="animate-spin inline-block w-5 h-5 mr-2 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2.091-2.647zm0 0l-.01-.01.01.01zm-.01-.01A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2.091-2.647z"
                    ></path>
                </svg>
                Analyzing content...
            </div>

            <div id="fileNameSection">
                <label
                    htmlFor="suggestedFileName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Suggested File Name:
                </label>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        id="suggestedFileName"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 text-sm truncate"
                        placeholder="File name suggestion here..."
                        value={suggestedFileName}
                        readOnly
                        ref={fileNameRef}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'default' }}
                    />
                    <button
                        id="copyFileNameBtn"
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy File Name"
                        onClick={() => handleCopy(suggestedFileName, fileNameRef)}
                        disabled={isCopyButtonsDisabled}
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#374151' }}
                        >
                            <path
                                d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z"
                                fill="#000000"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div id="altTextSection">
                <label
                    htmlFor="suggestedAltText"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Suggested Alt Text:
                </label>
                <div className="flex items-center space-x-2">
                    <textarea
                        id="suggestedAltText"
                        rows="2"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 resize-none text-sm"
                        placeholder="Alt text suggestion here..."
                        value={suggestedAltText}
                        readOnly
                        ref={altTextRef}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'default' }}
                    ></textarea>
                    <button
                        id="copyAltTextBtn"
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy Alt Text"
                        onClick={() => handleCopy(suggestedAltText, altTextRef)}
                        disabled={isCopyButtonsDisabled}
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#374151' }}
                        >
                            <path
                                d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z"
                                fill="#000000"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div id="keywordsSection">
                <label
                    htmlFor="suggestedKeywords"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Suggested Keywords / Tags (comma-separated):
                </label>
                <div className="flex items-center space-x-2">
                    <textarea
                        id="suggestedKeywords"
                        rows="3"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 resize-none text-sm"
                        placeholder="Keywords/Tags suggestion here..."
                        value={suggestedKeywords}
                        readOnly
                        ref={keywordsRef}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'default' }}
                    ></textarea>
                    <button
                        id="copyKeywordsBtn"
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy Keywords"
                        onClick={() => handleCopy(suggestedKeywords, keywordsRef)}
                        disabled={isCopyButtonsDisabled}
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#374151' }}
                        >
                            <path
                                d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z"
                                fill="#000000"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div id="tipsSection">
                <label
                    htmlFor="suggestedTips"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Some Tips
                </label>
                <div className="flex items-center space-x-2">
                    <textarea
                        id="suggestedTips"
                        rows="10"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 resize-none text-sm"
                        placeholder="Tips suggestions here..."
                        value={suggestedTips}
                        readOnly
                        ref={tipsRef}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'default' }}
                    ></textarea>
                    <button
                        id="copyTipsBtn"
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy Tips"
                        onClick={() => handleCopy(suggestedTips, tipsRef)}
                        disabled={isCopyButtonsDisabled}
                    >
                        <svg
                            width="20px"
                            height="20px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#374151' }}
                        >
                            <path
                                d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z"
                                fill="#000000"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                id="statusMessage"
                className="text-center text-sm text-gray-600 min-h-[1.25rem]"
            >
                {statusMessage}
            </div>
        </div>
    );
};

export default SEOManager;
