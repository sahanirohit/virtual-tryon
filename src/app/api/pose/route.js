import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { modelImageBase64, modelMimeType, poseName, poseDescription, aspectRatio, imageQuality, apiKey: clientApiKey } =
            await request.json();

        if (!modelImageBase64) {
            return NextResponse.json(
                { error: "Model image is required" },
                { status: 400 }
            );
        }

        if (!poseName) {
            return NextResponse.json(
                { error: "Pose name is required" },
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

        const prompt = `You are an expert fashion photography AI specializing in pose transformation.

I am providing an image of a person (a virtual fashion model). Your task is to regenerate this EXACT same person in a different pose.

TARGET POSE: "${poseName}" — ${poseDescription}

CRITICAL REQUIREMENTS — you MUST follow ALL of these strictly:
- PRESERVE the person's face EXACTLY — same facial features, expression, skin tone, hair style, hair color, makeup
- PRESERVE the outfit/clothing EXACTLY — same garment, same colors, same patterns, same accessories
- PRESERVE the background EXACTLY — same setting, same colors, same lighting environment
- CHANGE ONLY the body pose/posture to match the target pose described above
- The clothing should drape and fold naturally on the body in the new pose
- Maintain identical lighting direction, intensity, and color temperature
- The result must look like a real photograph taken in the same session, just a different pose
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
        console.error("Pose generation error:", error);
        const status = error.status || error.httpStatusCode || 500;
        let message = error.message || "Failed to generate pose.";
        if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
        return NextResponse.json({ error: message }, { status });
    }
}
