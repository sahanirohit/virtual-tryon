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
            faceImages,
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

        const faceImagesArray = faceImages || [];
        if (faceImagesArray.length === 0 && modelImageBase64) {
            faceImagesArray.push({ base64: modelImageBase64, mimeType: modelMimeType || "image/jpeg" });
        }
        if (faceImagesArray.length === 0) {
            return NextResponse.json({ error: "At least one face reference image is required" }, { status: 400 });
        }

        const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const IMAGE_MODEL = MODEL_MAP[aiModel] || MODEL_MAP.pro;
        const refMime = referenceMimeType || "image/jpeg";

        // ═══════════════════════════════════════════
        // STEP 1: Analyze the style reference image
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
        // STEP 2: Remove/blur the face from style reference
        // Creates a faceless version of the reference image
        // ═══════════════════════════════════════════
        console.log("🎭 STEP 2: Removing face from style reference...\n");

        const editResponse = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: [{
                role: "user",
                parts: [
                    {
                        text: `Edit this image: completely remove the person's face. Replace the face area with a smooth, blank, skin-toned oval — like a mannequin or faceless figure. Keep EVERYTHING else exactly the same — the body, pose, outfit, clothing details, background, lighting, colors, composition. Only erase the facial features (eyes, nose, mouth, eyebrows) and replace with smooth blank skin. The rest of the image must be pixel-perfect identical.`
                    },
                    { inlineData: { mimeType: refMime, data: referenceImageBase64 } },
                ],
            }],
            config: {
                responseModalities: ["image", "text"],
                imageConfig: {
                    aspectRatio: aspectRatio || "9:16",
                    ...(imageQuality ? { imageSize: imageQuality } : {}),
                },
            },
        });

        let facelessImageData = null;
        let facelessMime = "image/png";
        const editParts = editResponse.candidates?.[0]?.content?.parts;
        if (editParts) {
            const imgPart = editParts.find((p) => p.inlineData);
            if (imgPart) {
                facelessImageData = imgPart.inlineData.data;
                facelessMime = imgPart.inlineData.mimeType || "image/png";
            }
        }

        if (!facelessImageData) {
            console.log("⚠️ Face removal failed, falling back to text-only approach\n");
        } else {
            console.log("✅ Faceless reference created\n");
        }

        // ═══════════════════════════════════════════
        // STEP 3: Generate final image
        // Face reference photos + faceless style image + scene description
        // ═══════════════════════════════════════════
        const faceCount = faceImagesArray.length;
        console.log(`✨ STEP 3: Generating with ${faceCount} face ref(s) + ${facelessImageData ? "faceless reference" : "text-only"}...\n`);

        const generationPrompt = `I am providing ${faceCount} photo${faceCount > 1 ? "s" : ""} of the SAME person from different angles. These are the IDENTITY SOURCE — study every detail of this person's face: eye shape, nose, jawline, lips, skin tone, face shape, hair color and texture.

${facelessImageData
    ? `I am also providing a FACELESS reference image — it shows the exact pose, outfit, scene, and lighting I want, but with the face removed. Use this image as your composition guide.`
    : ``
}

Here is a detailed description of the target scene:
${sceneDescription}

YOUR TASK: Generate a photorealistic image of the person from the identity photos, placed into the scene described above.

CRITICAL RULES:
- The FACE must be 100% from the identity reference photos — exact same eyes, nose, lips, jawline, skin tone, face shape
- The POSE, OUTFIT, SCENE, and LIGHTING must match the description${facelessImageData ? " and faceless reference image" : ""}
- Do NOT use any other face — ONLY the identity from the provided face reference photos
- Photorealistic quality, professional camera, natural skin with visible pores and texture
- The result must look like a real photograph`;

        const parts = [{ text: generationPrompt }];

        // Add face reference images first
        for (const faceImg of faceImagesArray) {
            parts.push({
                inlineData: {
                    mimeType: faceImg.mimeType || "image/jpeg",
                    data: faceImg.base64,
                },
            });
        }

        // Add faceless reference image last (if available)
        if (facelessImageData) {
            parts.push({
                inlineData: {
                    mimeType: facelessMime,
                    data: facelessImageData,
                },
            });
        }

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
