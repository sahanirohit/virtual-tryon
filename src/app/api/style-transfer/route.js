import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL_MAP = {
    pro: "gemini-3-pro-image-preview",
    flash: "gemini-3.1-flash-image-preview",
};

const ANALYSIS_MODEL = "gemini-2.5-flash";

export async function POST(request) {
    try {
        const {
            modelImageBase64,
            modelMimeType,
            referenceImageBase64,
            referenceMimeType,
            aspectRatio,
            imageQuality,
            aiModel,
            apiKey: clientApiKey,
        } = await request.json();

        if (!referenceImageBase64) {
            return NextResponse.json({ error: "Reference image is required" }, { status: 400 });
        }

        if (!modelImageBase64) {
            return NextResponse.json({ error: "Model image is required" }, { status: 400 });
        }

        const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const IMAGE_MODEL = MODEL_MAP[aiModel] || MODEL_MAP.pro;
        const refMime = referenceMimeType || "image/jpeg";
        const modelMime = modelMimeType || "image/jpeg";

        // ═══════════════════════════════════════════
        // STEP 1: Analyze the reference image
        // Extract detailed description of pose, outfit, scene
        // ═══════════════════════════════════════════
        console.log("\n🔍 STEP 1: Analyzing style reference...\n");

        const analysisResponse = await ai.models.generateContent({
            model: ANALYSIS_MODEL,
            contents: [{
                role: "user",
                parts: [
                    {
                        text: `Analyze this image in extreme detail for recreating it with a different person. Describe:
1. POSE & BODY: exact position, posture, camera angle, hand/leg placement, head tilt, gaze direction
2. OUTFIT: every clothing piece — type, color, fabric, fit, pattern, accessories, shoes, jewelry
3. SCENE: background, location, props, furniture, architecture
4. LIGHTING: direction, quality, color temperature, shadows, mood
5. CAMERA: framing, focal length feel, depth of field
6. HAIR: color, length, style, arrangement

DO NOT describe facial features. Format as one flowing paragraph usable as an image generation prompt.`
                    },
                    { inlineData: { mimeType: refMime, data: referenceImageBase64 } },
                ],
            }],
        });

        const sceneDescription = analysisResponse.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
        if (!sceneDescription) {
            return NextResponse.json({ error: "Failed to analyze reference image" }, { status: 500 });
        }
        console.log("📝 Scene:", sceneDescription.substring(0, 200), "...\n");

        // ═══════════════════════════════════════════
        // STEP 2: Generate final image
        // Model image (identity) + Reference image (style) + Scene description
        // ═══════════════════════════════════════════
        console.log("✨ STEP 2: Generating style transfer with model identity...\n");

        const generationPrompt = `I am providing TWO images:

1. **MODEL IMAGE** (first image): This is the IDENTITY SOURCE. Study every detail of this person's face: eye shape, nose, jawline, lips, skin tone, face shape, hair color and texture. This is the person who must appear in the final image.

2. **REFERENCE IMAGE** (second image): This is the STYLE SOURCE. It shows the exact pose, outfit, scene, and lighting I want to recreate. Use this as your visual guide for composition.

Here is a detailed description of the target scene extracted from the reference:
${sceneDescription}

YOUR TASK: Generate a photorealistic image that recreates the reference image's pose, outfit, scene, and lighting — but with the person from the model image.

CRITICAL RULES:
- The FACE must be 100% from the model image — exact same eyes, nose, lips, jawline, skin tone, face shape
- The POSE, OUTFIT, SCENE, and LIGHTING must match the reference image and description
- Do NOT use the reference image's face — ONLY the model image's face/identity
- Photorealistic quality, professional camera, natural skin with visible pores and texture
- The result must look like a real photograph of the model person in the reference scene`;

        const parts = [
            { text: generationPrompt },
            // Model image first (identity source)
            {
                inlineData: {
                    mimeType: modelMime,
                    data: modelImageBase64,
                },
            },
            // Reference image second (style source)
            {
                inlineData: {
                    mimeType: refMime,
                    data: referenceImageBase64,
                },
            },
        ];

        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: [{ role: "user", parts }],
            config: {
                responseModalities: ["image", "text"],
                imageConfig: {
                    aspectRatio: aspectRatio || "9:16",
                    ...(imageQuality ? { imageSize: imageQuality } : {}),
                },
            },
        });

        const responseParts = response.candidates?.[0]?.content?.parts;
        if (!responseParts || responseParts.length === 0) {
            return NextResponse.json({ error: "No image generated" }, { status: 500 });
        }

        const imagePart = responseParts.find((part) => part.inlineData);
        if (!imagePart) {
            const textPart = responseParts.find((part) => part.text);
            return NextResponse.json(
                { error: "No image generated. " + (textPart?.text || "Unknown error") },
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
        if (status === 429) message = "Rate limit exceeded. Please wait and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded.";
        return NextResponse.json({ error: message }, { status });
    }
}
