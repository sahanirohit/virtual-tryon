import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3-pro-image-preview";

export async function POST(request) {
    try {
        const { modelImageBase64, modelMimeType, referenceImageBase64, referenceMimeType, aspectRatio, imageQuality, apiKey: clientApiKey } =
            await request.json();

        if (!modelImageBase64 || !referenceImageBase64) {
            return NextResponse.json(
                { error: "Both model image and reference image are required" },
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

        const prompt = `You are performing a face-consistent style transfer between two images.

IMAGE 1 (first uploaded image) = IDENTITY SOURCE. Extract the face, facial features, skin tone, and face shape ONLY from this image. The final output MUST have this person's face. This is NON-NEGOTIABLE.

IMAGE 2 (second uploaded image) = STYLE REFERENCE ONLY. Copy the pose, body position, outfit, clothing, environment, scene, background, and lighting from this image. DO NOT use the face from this image. The face in the reference must be COMPLETELY REPLACED with the face from Image 1.

CRITICAL RULES:
- The output face MUST be 100% from Image 1 — same eyes, nose, lips, jawline, face shape
- The output pose, outfit, and scene MUST be from Image 2
- NEVER output the reference image as-is — you MUST swap the face
- If the reference has a visible face, replace it entirely with Image 1's face

The image exudes a high-fidelity aesthetic where skin realism is paramount; the texture of her face is vivid with clear, fair, and flawless skin across the nose and cheeks without any blemishes, acne marks, or redness. A natural, healthy oil sheen highlights the bridge of her nose and upper cheekbones, contrasting with a matte finish on the jawline, giving the skin organic dimensionality.

Makeup is minimal or bare-faced, skin appears fresh, long silky black hair, dewy, and naturally Korean girl like glowing skin.

High quality, photorealistic result.`;

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
                                mimeType: referenceMimeType || "image/jpeg",
                                data: referenceImageBase64,
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
        console.error("Style transfer error:", error);
        const status = error.status || error.httpStatusCode || 500;
        let message = error.message || "Failed to generate style transfer image.";
        if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
        return NextResponse.json({ error: message }, { status });
    }
}
