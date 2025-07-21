import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TbMicrophone } from "react-icons/tb";
import { FaArrowUp } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import UserChatBubble from "./UserChatBubble";
import AgentChatBubble from "./AgentChatBubble";
import Thought from "./Thought";
import "./App.css";

// the api key was redacted for security reasons
const ai = new GoogleGenAI({ apiKey: "AIzaSyA-R-6JmaswaPzCKet-wK03AZupQFbYYBA" });
const functionDeclarations = [
    /* ——— Creation ——— */
    {
        name: "createPoster",
        description: "Create a complete poster design with title, content, and call-to-action",
        parameters: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.NUMBER, description: "Poster width in pixels (default: 1080)" },
                height: { type: Type.NUMBER, description: "Poster height in pixels (default: 1440)" },
                template: {
                    type: Type.STRING,
                    enum: ["event", "sale", "minimal"],
                    description: "Poster template style"
                },
                title: { type: Type.STRING, description: "Main title text" },
                subtitle: { type: Type.STRING, description: "Subtitle or date" },
                description: { type: Type.STRING, description: "Main content/description" },
                callToAction: { type: Type.STRING, description: "Call to action button text" },
                backgroundType: {
                    type: Type.STRING,
                    enum: ["solid", "gradient", "pattern"],
                    description: "Background style"
                }
            }
        }
    },
    {
        name: "createFlyer",
        description: "Create a professional flyer with headline, body text, and contact information",
        parameters: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.NUMBER, description: "Flyer width (default: 816px)" },
                height: { type: Type.NUMBER, description: "Flyer height (default: 1056px)" },
                style: {
                    type: Type.STRING,
                    enum: ["business", "party", "sale", "announcement"],
                    description: "Flyer style"
                },
                headline: { type: Type.STRING, description: "Main headline" },
                subheading: { type: Type.STRING, description: "Supporting text" },
                bodyText: { type: Type.STRING, description: "Main content" },
                contactInfo: { type: Type.STRING, description: "Contact details" },
                logoText: { type: Type.STRING, description: "Logo or brand name" },
                colorScheme: {
                    type: Type.STRING,
                    enum: ["blue", "red", "green", "purple", "orange"],
                    description: "Color scheme"
                }
            }
        }
    },
    {
        name: "createBusinessCard",
        description: "Create a professional business card design",
        parameters: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.NUMBER, description: "Card width (default: 420px)" },
                height: { type: Type.NUMBER, description: "Card height (default: 252px)" },
                name: { type: Type.STRING, description: "Person's name" },
                title: { type: Type.STRING, description: "Job title" },
                company: { type: Type.STRING, description: "Company name" },
                phone: { type: Type.STRING, description: "Phone number" },
                email: { type: Type.STRING, description: "Email address" },
                website: { type: Type.STRING, description: "Website URL" },
                colorScheme: {
                    type: Type.STRING,
                    enum: ["professional", "creative", "minimal"],
                    description: "Design style"
                }
            }
        }
    },
    {
        name: "createSocialMediaPost",
        description: "Create social media post graphics for various platforms",
        parameters: {
            type: Type.OBJECT,
            properties: {
                size: {
                    type: Type.STRING,
                    enum: ["instagram", "facebook", "twitter", "linkedin"],
                    description: "Platform size format"
                },
                template: {
                    type: Type.STRING,
                    enum: ["quote", "announcement", "product", "tip"],
                    description: "Post template type"
                },
                mainText: { type: Type.STRING, description: "Main message" },
                subtitle: { type: Type.STRING, description: "Secondary text (optional)" },
                hashtags: { type: Type.STRING, description: "Hashtags" },
                brandName: { type: Type.STRING, description: "Brand/company name" },
                colorTheme: {
                    type: Type.STRING,
                    enum: ["vibrant", "minimal", "professional"],
                    description: "Color theme"
                }
            }
        }
    },
    {
        name: "createInfographic",
        description: "Create simple infographic with data points and visual elements",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Infographic title" },
                dataPoints: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.STRING },
                            color: {
                                type: Type.OBJECT,
                                properties: {
                                    red: { type: Type.NUMBER },
                                    green: { type: Type.NUMBER },
                                    blue: { type: Type.NUMBER },
                                    alpha: { type: Type.NUMBER }
                                }
                            }
                        }
                    },
                    description: "Array of data points to visualize"
                },
                layout: {
                    type: Type.STRING,
                    enum: ["vertical", "horizontal", "grid"],
                    description: "Layout arrangement"
                }
            }
        }
    },
    {
        name: "createBrochure",
        description: "Create a tri-fold brochure layout",
        parameters: {
            type: Type.OBJECT,
            properties: {
                companyName: { type: Type.STRING, description: "Company name" },
                tagline: { type: Type.STRING, description: "Company tagline" },
                sections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            content: { type: Type.STRING }
                        }
                    },
                    description: "Content sections for the brochure"
                },
                contactInfo: { type: Type.STRING, description: "Contact information" },
                colorScheme: { type: Type.STRING, description: "Color scheme preference" }
            }
        }
    }
    , {
        name: "createEvergreenTree",
        description: "Draw a 5-layer evergreen (conifer) tree and return it as a grouped node.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                height: { type: Type.NUMBER, description: "Overall tree height (px)" },
                width: { type: Type.NUMBER, description: "Base width of tree (px)" },
                xpos: { type: Type.NUMBER, description: "X position (px)" },
                ypos: { type: Type.NUMBER, description: "Y position (px)" },
                leaf_color: {
                    type: Type.OBJECT,
                    description: "RGBA foliage color",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                stem_color: {
                    type: Type.OBJECT,
                    description: "RGBA trunk color",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                }
            }
        }
    },
    {
        name: "createForest",
        description: "Generate a forest of randomly placed evergreen and oak trees.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                num_trees: {
                    type: Type.NUMBER,
                    description: "How many trees to create"
                },
                tree_data: {
                    type: Type.OBJECT,
                    description: "Default height, width & colors for each tree",
                    properties: {
                        height: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        leaf_color: {
                            type: Type.OBJECT,
                            properties: {
                                red: { type: Type.NUMBER },
                                green: { type: Type.NUMBER },
                                blue: { type: Type.NUMBER },
                                alpha: { type: Type.NUMBER }
                            },
                            required: ["red", "green", "blue", "alpha"]
                        },
                        stem_color: {
                            type: Type.OBJECT,
                            properties: {
                                red: { type: Type.NUMBER },
                                green: { type: Type.NUMBER },
                                blue: { type: Type.NUMBER },
                                alpha: { type: Type.NUMBER }
                            },
                            required: ["red", "green", "blue", "alpha"]
                        }
                    }
                },
                xrange: {
                    type: Type.OBJECT,
                    description: "X coordinate range for tree placement",
                    properties: {
                        low: { type: Type.NUMBER },
                        high: { type: Type.NUMBER }
                    }
                },
                yrange: {
                    type: Type.OBJECT,
                    description: "Y coordinate range for tree placement",
                    properties: {
                        low: { type: Type.NUMBER },
                        high: { type: Type.NUMBER }
                    }
                }
            }
        }
    },
    {
        name: "createPixelArt",
        description:
            "Render a rows×columns pixel-art grid. colors is a row-major array of hex strings.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                rows: { type: Type.NUMBER, description: "Grid rows" },
                columns: { type: Type.NUMBER, description: "Grid columns" },
                canvasWidth: { type: Type.NUMBER, description: "Total width (optional)" },
                canvasHeight: { type: Type.NUMBER, description: "Total height (optional)" },
                pixelSize: { type: Type.NUMBER, description: "Square size if no canvas dims" },
                colors: {
                    type: Type.ARRAY,
                    description: "Row-major list of #RRGGBB or #RGB strings",
                    items: { type: Type.STRING }
                },
                x: { type: Type.NUMBER, description: "X offset (default 0)" },
                y: { type: Type.NUMBER, description: "Y offset (default 0)" }
            },
            required: ["rows", "columns", "colors"]
        }
    },
    {
        name: "createGrid",
        description: "Create a grid of equally‐sized rectangles, alternating two colors if provided",
        parameters: {
            type: Type.OBJECT,
            properties: {
                rows: {
                    type: Type.NUMBER,
                    description: "Number of rows in the grid"
                },
                columns: {
                    type: Type.NUMBER,
                    description: "Number of columns in the grid"
                },
                width: {
                    type: Type.NUMBER,
                    description: "Width of each rectangle"
                },
                height: {
                    type: Type.NUMBER,
                    description: "Height of each rectangle"
                },
                color1: {
                    type: Type.OBJECT,
                    description: "Primary fill color (RGBA)",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                color2: {
                    type: Type.OBJECT,
                    description: "Secondary fill color (RGBA), optional",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    }
                }
            },
            required: ["rows", "columns", "width", "height", "color1"]
        }
    },
    {
        name: "createRectangle",
        description: "Create a rectangle on the artboard.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                fill: {
                    type: Type.OBJECT,
                    description: "RGBA (0‑1)",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["width", "height"]
        }
    },
    {
        name: "createEllipse",
        description: "Create an ellipse on the artboard.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                rx: { type: Type.NUMBER },
                ry: { type: Type.NUMBER },
                fill: {
                    type: Type.OBJECT,
                    description: "RGBA (0‑1)",
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["rx", "ry"]
        }
    },
    {
        name: "createLine",
        description: "Create a line segment.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                start: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                    required: ["x", "y"]
                },
                end: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                    required: ["x", "y"]
                },
                stroke: {
                    type: Type.OBJECT,
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                width: { type: Type.NUMBER },
                dashPattern: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["start", "end"]
        }
    },
    {
        name: "createText",
        description: "Add a text node.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                content: { type: Type.STRING },
                fontSize: { type: Type.NUMBER },
                textColor: {
                    type: Type.OBJECT,
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                },
                align: { type: Type.STRING, enum: ["left", "center", "right"] },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["content"]
        }
    },
    {
        name: "createPath",
        description: "Create an SVG path.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                svgPath: { type: Type.STRING },
                stroke: {
                    type: Type.OBJECT,
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    }
                },
                fill: {
                    type: Type.OBJECT,
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    }
                },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["svgPath"]
        }
    },
    {
        name: "createImage",
        description: "Place an image blob.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                blob: { type: Type.STRING },
                width: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["blob"]
        }
    },
    {
        name: "createGroup",
        description: "Group nodes by ID.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                nodeIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["nodeIds"]
        }
    },
    /* ——— Updates ——— */
    {
        name: "moveNode",
        description: "Move a node.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                dx: { type: Type.NUMBER },
                dy: { type: Type.NUMBER }
            },
            required: ["id"]
        }
    },
    {
        name: "rotateNode",
        description: "Rotate a node.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                degrees: { type: Type.NUMBER },
                pivot: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }
                }
            },
            required: ["id", "degrees"]
        }
    },
    {
        name: "updateFill",
        description: "Change fill color.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                fill: {
                    type: Type.OBJECT,
                    properties: {
                        red: { type: Type.NUMBER },
                        green: { type: Type.NUMBER },
                        blue: { type: Type.NUMBER },
                        alpha: { type: Type.NUMBER }
                    },
                    required: ["red", "green", "blue", "alpha"]
                }
            },
            required: ["id", "fill"]
        }
    },
    {
        name: "setOpacity",
        description: "Set opacity.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                value: { type: Type.NUMBER }
            },
            required: ["id", "value"]
        }
    },
    {
        name: "lockNode",
        description: "Lock or unlock a node.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                locked: { type: Type.BOOLEAN }
            },
            required: ["id"]
        }
    },
    /* ——— Deletion ——— */
    {
        name: "deleteNode",
        description: "Delete a node.",
        parameters: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING } },
            required: ["id"]
        }
    },
    {
        name: "clearCanvas",
        description: "Remove all nodes.",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    /* ——— Queries ——— */
    {
        name: "listNodes",
        description: "List nodes (optionally deep).",
        parameters: {
            type: Type.OBJECT,
            properties: { deep: { type: Type.BOOLEAN } }
        }
    },
    {
        name: "getNode",
        description: "Get a node by ID.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                deep: { type: Type.BOOLEAN }
            },
            required: ["id"]
        }
    }
];

export default function ChatInterface({ sandboxProxy }) {
    function speak(txt) {
        return new Promise(res => {
            const u = new SpeechSynthesisUtterance(txt);
            u.onend = res;
            speechSynthesis.speak(u);
        });
    }

    const liveSessionRef = useRef(null);
    const voiceActiveRef = useRef(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [streamingThought, setStreamingThought] = useState("");
    const endRef = useRef(null);

    useEffect(() => {
        return () => {
            if (liveSessionRef.current) {
                liveSessionRef.current.stopRecording?.();
                liveSessionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        voiceActiveRef.current = voiceActive;
    }, [voiceActive]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streaming, streamingThought]);

    const to16kPCM = (audioData) => {
        const inRate = audioData.sampleRate;
        const chData = new Float32Array(audioData.numberOfFrames);
        audioData.copyTo(chData, { planeIndex: 0 });
        const ratio = inRate / 16000;
        const outLen = Math.floor(chData.length / ratio);
        const outPCM = new Int16Array(outLen);

        for (let i = 0; i < outLen; i++) {
            const idx = Math.floor(i * ratio);
            let s = chData[idx] * 0x7fff;
            s = Math.max(-32768, Math.min(32767, s));
            outPCM[i] = s;
        }
        return new Uint8Array(outPCM.buffer);
    };

    async function toggleVoice() {
        if (voiceActive) {
            await liveSessionRef.current?.stopRecording?.();
            liveSessionRef.current = null;
            setVoiceActive(false);
            return;
        }

        if (liveSessionRef.current) {
            await liveSessionRef.current.stopRecording?.();
            liveSessionRef.current = null;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setVoiceActive(true);
            await openLiveSession(stream);
        } catch (err) {
            console.error("Failed to get microphone access:", err);
            setVoiceActive(false);
        }
    }

    async function openLiveSession(stream) {
        let sessionClosed = false;
        let reader;

        try {
            const session = await ai.live.connect({
                model: "gemini-2.0-flash",
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: [{ functionDeclarations }],
                },
                callbacks: {
                    onOpen: () => console.log("🔊 Live session opened"),
                    onMessage: handleLiveResponse,
                    onError: (e) => console.error("Live error:", e),
                    onClose: () => {
                        sessionClosed = true;
                        console.log("🔊 Live session closed");
                    },
                },
            });

            liveSessionRef.current = session;
            const track = stream.getAudioTracks()[0];
            reader = new MediaStreamTrackProcessor({ track }).readable.getReader();

            const isSessionAlive = () =>
                !sessionClosed &&
                session.readyState === WebSocket.OPEN;

            (async () => {
                while (voiceActiveRef.current && isSessionAlive()) {
                    try {
                        const { value: audioData, done } = await reader.read();
                        if (done) break;

                        const pcm16k = to16kPCM(audioData);

                        if (isSessionAlive()) {
                            await session.sendRealtimeInput({
                                audio: { data: pcm16k, mimeType: "audio/pcm;rate=16000" },
                            });
                        }
                    } catch (err) {
                        if (!isSessionAlive()) break;
                        console.error("Error sending audio chunk:", err);
                    } finally {
                        audioData?.close?.();
                    }
                }

                reader.releaseLock();
                stream.getTracks().forEach(t => t.stop());
            })();

            session.stopRecording = async () => {
                sessionClosed = true;
                try {
                    await reader?.cancel();
                    reader?.releaseLock();
                    await session.close();
                } catch { }
                stream.getTracks().forEach(t => t.stop());
            };

        } catch (err) {
            console.error("Failed to start live session:", err);
            setVoiceActive(false);
            stream.getTracks().forEach(t => t.stop());
        }
    }

    async function handleLiveResponse(msg) {
        if (msg.data) {
            const wavBlob = new Blob([msg.data], { type: "audio/wav" });
            new Audio(URL.createObjectURL(wavBlob)).play().catch(() => { });
        }

        if (msg.text?.trim().startsWith("{") && msg.text.includes('"thoughts"')) {
            try {
                const payload = JSON.parse(msg.text);
                for (const thought of payload.thoughts ?? []) {
                    await speak(thought);
                }
                if (payload.summary) await speak(payload.summary);
            } catch {
                /* ignore partial / malformed JSON */
            }
        }

        for (const call of msg.toolCalls ?? []) {
            const fn = sandboxProxy?.[call.name];
            if (typeof fn === "function") {
                try { await fn(call.args ?? {}); } catch (err) {
                    console.error(`Tool "${call.name}" failed:`, err);
                }
            }
        }
    }

    async function fetchCanvasState() {
        try {
            if (typeof sandboxProxy?.listNodes === "function") {
                return await sandboxProxy.listNodes({ deep: true });
            }
        } catch { };
        return [];
    }

    const availableFunctionDocs =
        `
        - createPoster - Event posters, sale announcements, promotional materials
- createFlyer - Business flyers, party invitations, informational sheets
- createBusinessCard - Professional networking cards
- createSocialMediaPost - Platform-optimized social graphics
- createBrochure - Company brochures, product information
- createInfographic - Data visualization, statistics, process flows
        createForest - creates a forest · createEvergreenTree - creates an evergreen tree ·createPixelArt - creates a pixel art grid · createGrid - checkerboard grid · createRectangle – rectangle · createEllipse – ellipse · createLine – line · createText – text · createPath – svg path · createImage – image · createGroup – group · moveNode – move · rotateNode – rotate · updateFill – fill · setOpacity – opacity · lockNode – lock · deleteNode – delete · clearCanvas – clear · listNodes – list · getNode – get`;

    async function buildPrompt(userText) {
        const state = JSON.stringify(await fetchCanvasState()).slice(0, 8000);
        return `You are **Imagine**, an expert AI agent for creating professional designs in Adobe Express. Your primary goal is to translate user requests into high-quality, ready-to-use marketing materials by calling the appropriate functions.

## Your Capabilities
You can now create complete marketing materials including:
- **Posters** (for events, sales, and announcements)
- **Flyers** (for business, parties, and promotions)
- **Business Cards** (professional, creative, or minimal styles)
- **Social Media Posts** (optimized for Instagram, Facebook, etc.)
- **Brochures** (for company info or product catalogs)
- **Infographics** (for data visualization and statistics)

---
## Instructions for Creating Designs
When a user requests a design, you **must**:
1.  **Choose the best function** based on their needs (e.g., 'createPoster' for a concert announcement).
2.  **Use professional design principles.** Pay close attention to color schemes, typography, visual hierarchy, and balance to ensure the final product is polished and effective.
3.  **Infer missing details.** If the user doesn't provide all parameters (like colors or exact dimensions), use your judgment to fill in the blanks based on the design's purpose and target audience.
4.  **Group all related elements** together so the user can easily edit them later.


For simpler requests, like drawing a single shape or moving an object, use the basic functions.

---
**CURRENT CANVAS:** ${state}
 
**ALL AVAILABLE FUNCTIONS:** ${availableFunctionDocs}
 
**USER PROMPT:**
${userText}`;
    }

    async function sendPrompt() {
        const userText = input.trim();
        if (!userText || isSending) return;

        setMessages(prev => [...prev, { role: "user", text: userText }]);
        setInput("");
        setIsSending(true);

        let thoughts = [];
        let summary = "Done!";
        const litePrompt = `You are Imagine planning your actions. Respond ONLY with valid JSON: {\n  "thoughts": ["step1","step2",...],\n  "summary": "Past-tense summary"\n}`;
        
        try {
            const resp1 = await ai.models.generateContent({
                model: "gemini-2.0-flash-lite",
                contents: litePrompt + `\nUSER PROMPT:\n${userText}`,
                config: { temperature: 0 }
            });
            const raw = resp1.text?.trim() || "";
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || "{}";
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed.thoughts)) thoughts = parsed.thoughts;
            if (parsed.summary) summary = parsed.summary;
        } catch (e) {
            console.error("Lite parse error", e);
        }

        setStreaming(true);
        for (let i = 0; i < thoughts.length; i++) {
            setStreamingThought(thoughts[i]);
            if (i < thoughts.length - 1) {
                await new Promise(r => setTimeout(r, 100 + Math.random() * 600));
            }
        }

        let error = false;
        const start = Date.now();
        try {
            const prompt2 = await buildPrompt(userText);
            const resp2 = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt2,
                config: {
                    temperature: 0,
                    tools: [{ functionDeclarations }],
                    toolConfig: { functionCallingConfig: { mode: "auto" } }
                }
            });
            if (resp2.functionCalls?.length) {
                console.log(resp2.functionCalls);
                for (const call of resp2.functionCalls) {
                    const fn = sandboxProxy?.[call.name];
                    if (typeof fn === "function") await fn(call.args || {});
                }
            }
        } catch (e) {
            console.error(e);
            summary = "⚠️ Error executing actions.";
            error = true;
        }
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        setStreaming(false);
        setMessages(prev => [
            ...prev,
            {
                role: "thought",
                text: streamingThought,
                thinking: false,
                time: parseFloat(elapsed),
                finalStructure: thoughts
            },
            { role: "assistant", text: summary }
        ]);

        setIsSending(false);
    }

    const onKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); 
            sendPrompt();
        }
    };

    // Mock components for demonstration - replace with your actual components
    const UserChatBubble = ({ message }) => (
        <div className="flex justify-end mb-4">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-xs shadow-sm">
                {message}
            </div>
        </div>
    );

    const AgentChatBubble = ({ message }) => (
        <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs shadow-sm">
                {message}
            </div>
        </div>
    );

    const Thought = ({ isThinking, thinkingMessage }) => (
        <div className="flex justify-start mb-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2 mb-1">
                    <HiSparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-700">
                        {isThinking ? "Thinking..." : "Thought"}
                    </span>
                </div>
                <div className="text-sm text-gray-700">
                    {thinkingMessage}
                    {isThinking && (
                        <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <HiSparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Imagine AI</h1>
                            <p className="text-xs text-gray-500">Professional Design Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {voiceActive && (
                            <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Recording</span>
                            </div>
                        )}
                        {streaming && (
                            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Processing</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <HiSparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Imagine AI</h2>
                            <p className="text-gray-600 mb-6 max-w-md">
                                Create professional designs with AI. From posters to business cards, 
                                I'll help you build stunning marketing materials.
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-left">
                                    <div className="font-medium text-sm text-gray-800">Design Types</div>
                                    <div className="text-xs text-gray-500">Posters, Flyers, Cards</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-left">
                                    <div className="font-medium text-sm text-gray-800">Smart AI</div>
                                    <div className="text-xs text-gray-500">Professional Results</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {messages.map((msg, i) => {
                    if (msg.role === "user") return <UserChatBubble key={i} message={msg.text} />;
                    if (msg.role === "assistant") return <AgentChatBubble key={i} message={msg.text} />;
                    return (
                        <Thought
                            key={i}
                            isThinking={msg.thinking}
                            thinkingTime={msg.time}
                            thinkingMessage={msg.text}
                            final={msg.finalStructure}
                        />
                    );
                })}
                
                {streaming && <Thought isThinking={true} thinkingTime={0} thinkingMessage={streamingThought} />}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/60 px-6 py-4">
                <div className="relative">
                    {/* Input Container */}
                    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                        <div className="flex items-end space-x-3 p-4">
                            {/* Voice Button */}
                            <button
                                onClick={toggleVoice}
                                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                    voiceActive 
                                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                }`}
                                disabled={isSending}
                            >
                                {voiceActive ? (
                                    <TbMicrophoneOff className="w-5 h-5" />
                                ) : (
                                    <TbMicrophone className="w-5 h-5" />
                                )}
                            </button>

                            {/* Text Input */}
                            <div className="flex-1">
                                <textarea
                                    className="w-full resize-none bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm leading-relaxed max-h-32"
                                    placeholder="Describe the design you want to create..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    disabled={isSending || voiceActive}
                                    rows={1}
                                    style={{
                                        minHeight: '20px',
                                        height: 'auto',
                                        maxHeight: '128px',
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={sendPrompt}
                                disabled={isSending || voiceActive || !input.trim()}
                                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                    isSending || voiceActive || !input.trim()
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                }`}
                            >
                                {isSending ? (
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FaArrowUp className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                            <span>Press</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd>
                            <span>to send</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center space-x-1">
                            <span>Hold</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift</kbd>
                            <span>for new line</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}