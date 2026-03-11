import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const THEME_PROMPTS = {
  beach: "at a tropical beach, soft white sand, crystal blue ocean in the background, warm golden sunlight, palm trees, summer vibes",
  studio: "in a professional photography studio, clean white/grey seamless backdrop, professional softbox lighting, high-fashion editorial look",
  urban: "on a stylish urban city street, modern buildings, bokeh background, street fashion vibes, natural city light",
  gym: "in a modern upscale gym, gym equipment in background, bright motivational lighting, sports/fitness atmosphere",
  cafe: "in a cozy aesthetic café, warm ambient lighting, wooden tables, plants in background, latte art on the table",
  rooftop: "on a rooftop at golden hour, city skyline in the background, warm sunset tones, romantic dreamy lighting",
  garden: "in a lush blooming garden, flowers all around, soft dappled sunlight, ethereal nature setting",
  fashion: "at a high fashion editorial shoot, dramatic studio lighting, artistic background, luxury fashion brand vibes",
};

const OUTFIT_PROMPTS = {
  casual: "wearing stylish casual outfit — fitted jeans and a trendy crop top or stylish tee",
  ethnic: "wearing a beautiful traditional Indian ethnic outfit — elegant saree or lehenga with intricate embroidery and gold jewellery",
  bikini: "wearing a fashionable bikini or swimwear, beach-ready look",
  gym: "wearing trendy athletic/gym wear — sports bra and fitted leggings showing her athletic physique",
  party: "wearing a stunning bodycon party dress or glamorous evening outfit",
  jeans: "wearing fitted high-waist jeans with a stylish top, casual chic look",
  business: "wearing a chic business casual outfit — blazer, trousers, professional yet stylish",
  lingerie: "wearing elegant lingerie, tasteful and artistic boudoir photography style",
};

const MOOD_PROMPTS = {
  confident: "with a confident, powerful pose, direct eye contact with the camera, strong and assured expression",
  playful: "with a playful, fun expression, laughing or smiling candidly, dynamic energetic pose",
  seductive: "with a seductive, alluring expression, soft smoldering gaze, posed elegantly",
  elegant: "with a graceful, elegant demeanor, poised posture, soft sophisticated expression",
  fierce: "with a fierce, powerful expression, strong bold pose, intensity in the gaze",
  candid: "in a natural candid moment, looking away from camera or mid-action, authentic lifestyle feel",
};

export async function POST(request) {
  try {
    const { theme, outfit, mood, aspectRatio, customPrompt, apiKey: clientApiKey } = await request.json();

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it in .env.local or enter your API key." },
        { status: 500 }
      );
    }

    const themePart = THEME_PROMPTS[theme] || THEME_PROMPTS.studio;
    const outfitPart = OUTFIT_PROMPTS[outfit] || OUTFIT_PROMPTS.casual;
    const moodPart = MOOD_PROMPTS[mood] || MOOD_PROMPTS.confident;

    const prompt = `Generate a stunning, photorealistic full-body portrait photograph of a beautiful young Indian woman named Riya.

CHARACTER DETAILS (keep exactly consistent):
- Indian ethnicity, aged 18-22 years old
- Fair/light skin tone (wheatish-fair, natural Indian complexion)
- Curvy yet athletic body — full hourglass figure with toned muscles
- Beautiful cute face with expressive doe eyes, soft features, natural makeup
- Long lustrous dark hair (can be styled based on setting)
- Height: 5'5" to 5'7", full body visible

SCENE: ${themePart}

OUTFIT: ${outfitPart}

EXPRESSION & POSE: ${moodPart}${customPrompt ? `\n\nADDITIONAL DETAILS: ${customPrompt}` : ""}

PHOTOGRAPHY STYLE:
- Hyperrealistic, photographic quality — looks like a real professional photo
- Full body shot — head to toe visible
- Professional fashion/Instagram influencer photography
- Sharp focus on face, beautiful soft bokeh or environment in background
- Magazine-quality composition and lighting
- Skin texture should look natural and realistic
- The photo should look like it belongs on a luxury Instagram influencer page

Do NOT generate cartoon, anime, illustration or 3D render. This must look like a real high-resolution photograph.`;

    const ai = new GoogleGenAI({ apiKey });
    const MODEL = "gemini-3-pro-image-preview";

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
        imageConfig: {
          aspectRatio: aspectRatio || "9:16",
        },
      },
    };

    const response = await ai.models.generateContent({ model: MODEL, ...requestBody });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: "No image was generated. The model may not support this request." },
        { status: 500 }
      );
    }

    const imagePart = parts.find((part) => part.inlineData);
    if (!imagePart) {
      const textPart = parts.find((part) => part.text);
      return NextResponse.json(
        { error: "No image generated. Model response: " + (textPart?.text || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    });
  } catch (error) {
    console.error("Influencer generation error:", error);
    const status = error.status || error.httpStatusCode || 500;
    let message = error.message || "Failed to generate image.";
    if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
    else if (status === 400) message = `Invalid request: ${error.message}`;
    else if (message.toLowerCase().includes("safety")) message = `Image blocked by safety filters. Try a different outfit or scene.`;
    else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
    return NextResponse.json({ error: message }, { status });
  }
}
