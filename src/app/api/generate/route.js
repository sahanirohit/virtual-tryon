import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { imageBase64, mimeType, aspectRatio, imageQuality, apiKey: clientApiKey } = await request.json();

        if (!imageBase64) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 }
            );
        }

        const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured. Please set it in .env.local" },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const MODEL = "gemini-3-pro-image-preview";

        const prompt = `You are an expert fashion photography AI. Given the reference photo of this person, generate a stunning full-body portrait of this same person in a natural standing pose.

Requirements:
- Full body visible from head to toe
- Natural, confident standing pose (like a fashion model in a lookbook)
- The person should look exactly like the reference photo (same face, skin tone, hair)
- Clean, minimal studio background (soft gradient or neutral)
- Professional fashion photography lighting
- The person should be wearing their current outfit or a clean, stylish casual outfit
- High quality, photorealistic result
- The image should look like a professional model card or fashion editorial test shot`;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType || "image/jpeg",
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
            config: {
                responseModalities: ["image", "text"],
                imageConfig: {
                    aspectRatio: aspectRatio || "9:16",
                    ...(imageQuality ? { imageSize: imageQuality } : {}),
                },
            },
        };

        const response = await ai.models.generateContent({ model: MODEL, ...requestBody });

        // Extract the generated image from the response
        const parts = response.candidates?.[0]?.content?.parts;
        if (!parts || parts.length === 0) {
            return NextResponse.json(
                { error: "No image was generated. The model may not have been able to process this request." },
                { status: 500 }
            );
        }

        // Find the image part
        const imagePart = parts.find((part) => part.inlineData);
        if (!imagePart) {
            // Get any text response for debugging
            const textPart = parts.find((part) => part.text);
            return NextResponse.json(
                {
                    error: "No image generated. Model response: " + (textPart?.text || "Unknown error"),
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            image: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType || "image/png",
        });
    } catch (error) {
        console.error("Generation error:", error);
        const status = error.status || error.httpStatusCode || 500;
        let message = error.message || "Failed to generate image.";
        if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
        return NextResponse.json({ error: message }, { status });
    }
}

