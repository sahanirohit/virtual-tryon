import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { modelImageBase64, modelMimeType, outfitImageBase64, outfitMimeType, aspectRatio, imageQuality, apiKey: clientApiKey } =
            await request.json();

        if (!modelImageBase64 || !outfitImageBase64) {
            return NextResponse.json(
                { error: "Both model image and outfit image are required" },
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

        const prompt = `You are an expert virtual try-on AI specializing in fashion.

I am providing two images:
1. FIRST IMAGE: A reference photo of a person (the virtual model)
2. SECOND IMAGE: An outfit/clothing item

Your task is to dress the person in the first image with the outfit shown in the second image.

CRITICAL REQUIREMENTS — you must follow ALL of these:
- PRESERVE the person's face, facial features, skin tone, hair style, and hair color EXACTLY as they appear in the first image
- PRESERVE the person's body pose and stance EXACTLY as it is — do not change posture or body position
- PRESERVE the background EXACTLY as it appears in the first image — same colors, lighting, setting
- CHANGE ONLY the clothing — replace the current outfit with the one shown in the second image
- The outfit should fit naturally on the person's body, with realistic wrinkles, draping, and shadows
- Maintain the same lighting and color temperature across the entire image
- The result should look like a real photograph, not a collage or composite
- High quality, photorealistic result`;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: modelMimeType || "image/jpeg",
                                data: modelImageBase64,
                            },
                        },
                        {
                            inlineData: {
                                mimeType: outfitMimeType || "image/jpeg",
                                data: outfitImageBase64,
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

        // Extract the generated image
        const parts = response.candidates?.[0]?.content?.parts;
        if (!parts || parts.length === 0) {
            return NextResponse.json(
                { error: "No image was generated. The model may not have been able to process this request." },
                { status: 500 }
            );
        }

        const imagePart = parts.find((part) => part.inlineData);
        if (!imagePart) {
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
        console.error("Try-on generation error:", error);
        const status = error.status || error.httpStatusCode || 500;
        let message = error.message || "Failed to generate try-on image.";
        if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
        return NextResponse.json({ error: message }, { status });
    }
}
