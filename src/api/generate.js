import { GoogleGenerativeAI } from "@google/generative-ai";

// 1) Initialize the Google AI client with your API key from Vercel's environment variables
const genAI = new GoogleGenerativeAI("AIzaSyA-R-6JmaswaPzCKet-wK03AZupQFbYYBA");

// Helper function to convert a data URL to a Gemini-compatible part
function fileToGenerativePart(dataURL) {
    const match = dataURL.match(/data:(.*);base64,(.*)/);
    if (!match) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}

export default async function handler(request, response) {
    // --- CORS and Preflight Request Handling (Unchanged) ---
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return response.status(200).end();
    }

    if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { dataURL, prompt } = request.body;

        if (!dataURL || !prompt) {
            return response.status(400).json({ error: "Missing dataURL or prompt in the request body." });
        }

        // --- System Instructions for the Model ---
        const systemInstructions = `
        You are an SEO assistant. 
        Introduction to people who might use you:
        Content Creators, Graphics Designer, Engineers, or whoever wants to boost their website or content.
        You will be given the content of a poster designed by a designer and a short description of the website that needs to be optimized for better SEO ratings.
        Users may or may not add the target user details. If you are provided with the details of the target audience then give suggestions likewise.
        What you are supposed to do:
        - Generate Alt-Text for images based on the poster content and website description. Ensure alt-text is important for Google SEO and accessibility compliance.
        - Create SEO-Friendly Titles & Descriptions. Suggest optimized titles/headlines and meta descriptions.
        - Analyze the design text provided by the user. Suggest important keywords if missing.
        - Suggest optimized image file names (e.g., "health_tips_for_pregnant_women.png" instead of "design5.png").
        - Recommend Content-Length Improvements, e.g., improve Instagram captions.
        - Suggest strong high-ranking SEO keywords related to the design topic.
        Inputs from user:
        - Image of the poster/canvas
        - Context input provided by user

        Generate **only** a JSON object with these keys:
        • fileName — SEO-friendly filename (lowercase, dashes)
        • altText   — concise alt text describing the image
        • keywords  — 5–7 comma-separated SEO tags
        • tips  — an array of strings with general tips to improve the media overall
    `.trim();

        // 2) Get the generative model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });

        // 3) Convert the dataURL to the format Gemini needs
        const imagePart = fileToGenerativePart(dataURL);

        // 4) Combine system instructions with the user's prompt
        const fullPrompt = `${systemInstructions}\n\n## User's Context ##\n${prompt}`;

        // 5) Call the model with the combined prompt, image, and configuration
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }, imagePart] }],
            generationConfig: {
                responseMimeType: "application/json", // This ensures the output is a JSON object
                temperature: 0.7,
            },
        });

        // 6) Get the JSON text from the response and send it back to the client
        const responseJsonText = result.response.text();
        return response.status(200).json(JSON.parse(responseJsonText));

    } catch (err) {
        console.error(err);
        return response.status(500).json({ error: err.message });
    }
}

