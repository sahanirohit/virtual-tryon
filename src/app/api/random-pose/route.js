import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        let clientApiKey;
        try {
            const body = await request.json();
            clientApiKey = body.apiKey;
        } catch (_) {
            // No body provided, that's fine
        }

        const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_api_key_here") {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured. Please set it in .env.local" },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        // Generate a creative pose + angle with AI (text-only, no image needed)
        const ideaResponse = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are a creative fashion photography director. Generate ONE unique, creative pose and camera angle combination for a fashion editorial photoshoot.

Be highly creative and specific. Think like a top fashion photographer — describe the exact body position, hand placement, head tilt, weight distribution, and the precise camera angle and height.

Respond in EXACTLY this JSON format, nothing else:
{
  "pose": "A vivid, detailed description of the body pose (2-3 sentences)",
  "angle": "A specific camera angle description (1-2 sentences)",
  "mood": "The overall mood/vibe in 2-3 words"
}

Examples of the LEVEL of creativity and specificity expected:
- "Model mid-turn with weight shifting to back foot, one arm sweeping hair behind ear while the other hand rests on collarbone, chin tilted 15 degrees down with eyes looking up through lashes"
- "Crouched low with knees together, torso twisted to the left, both hands gripping the hem of the outfit pulling it taut, head thrown back with eyes closed"
- "Leaning dramatically forward from the waist at 45 degrees, arms stretched straight behind like wings, one foot pointed behind, face in sharp profile with lips slightly parted"

Be bold, editorial, and fashion-forward. Never repeat common poses like "hands on hips" or "standing straight." Surprise me.`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 1.5,
                topP: 0.95,
                responseMimeType: "application/json",
            },
        });

        let poseIdea;
        try {
            const rawText = ideaResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
            poseIdea = JSON.parse(rawText);
        } catch {
            poseIdea = {
                pose: "Dynamic editorial pose with dramatic body angle, one arm extended overhead stretching the fabric, weight on one leg with the other crossed behind, torso twisted slightly",
                angle: "Low angle camera at knee height looking upward, creating a powerful towering perspective",
                mood: "Bold and fierce",
            };
        }

        return NextResponse.json({
            pose: poseIdea.pose,
            angle: poseIdea.angle,
            mood: poseIdea.mood,
        });
    } catch (error) {
        console.error("Pose prompt generation error:", error);
        const status = error.status || error.httpStatusCode || 500;
        let message = error.message || "Failed to generate pose idea.";
        if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
        else if (status === 400) message = `Invalid request: ${error.message}`;
        else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
        return NextResponse.json({ error: message }, { status });
    }
}
