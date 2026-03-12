import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// ─── CONTENT TYPES BY CATEGORY ───
const CONTENT_TYPES = {
  glamour: {
    lingerie: {
      scene: "a luxury bedroom suite with floor-to-ceiling windows overlooking a city skyline at twilight, king-size bed with ivory silk sheets and plush pillows, warm ambient table lamps with golden shades",
      outfit: "an elegant French-lace bralette in deep burgundy wine with scalloped edges and matching high-waisted lace briefs with sheer mesh panels, a champagne silk robe draped loosely off one shoulder",
      lighting: "warm intimate golden lamplight mixed with cool blue twilight from the windows, soft directional key light from the left creating gentle shadows and dimension",
    },
    swimwear: {
      scene: "a pristine infinity pool overlooking the ocean at golden hour, turquoise water with gentle ripples, white marble deck with tropical palms casting dappled shadows",
      outfit: "a fashion-forward high-cut halter-neck bikini in rich terracotta ribbed fabric with thin gold ring hardware, barefoot with a delicate gold anklet",
      lighting: "intense golden-hour backlight from the setting sun, warm reflected fill from the water surface, golden rim light outlining her silhouette",
    },
    evening_gown: {
      scene: "a grand marble staircase in a luxury hotel lobby with crystal chandeliers, polished floors reflecting warm light, ornate gold railings",
      outfit: "a floor-length satin evening gown in midnight black with a daring thigh-high slit and plunging neckline, strappy crystal-embellished heels, diamond drop earrings",
      lighting: "dramatic chandelier light from above creating glamorous highlights, warm fill from the marble reflections, cinematic shadows on the staircase",
    },
    streetwear: {
      scene: "a trendy urban alley with colorful graffiti murals, exposed brick walls, vintage neon signs casting colored light, rain-dampened asphalt reflecting city lights",
      outfit: "an oversized cropped hoodie in dusty pink over a black sports bra, low-rise cargo pants with chain details, chunky platform sneakers, layered gold chains",
      lighting: "mixed neon colors from signs creating pink and teal rim lights, cool ambient twilight, cinematic urban atmosphere with bokeh from distant lights",
    },
    athleisure: {
      scene: "a modern rooftop terrace with city views at sunrise, sleek outdoor furniture, potted succulents, clean minimalist railings with morning mist",
      outfit: "a matching set of seamless high-waisted leggings and cropped sports bra in sage green with subtle ribbed texture, white sneakers, wireless earbuds",
      lighting: "soft early morning golden light from the horizon, warm directional side-light creating a healthy glow, gentle atmospheric haze",
    },
  },
  lifestyle: {
    morning_routine: {
      scene: "a bright airy modern apartment with floor-to-ceiling windows letting in golden morning light, minimalist white kitchen with marble countertops, a steaming coffee mug",
      outfit: "an oversized boyfriend shirt in soft white cotton barely buttoned, boy-short underwear, barefoot on warm hardwood floors, messy bun with loose face-framing strands",
      lighting: "beautiful warm morning sunlight streaming through sheer curtains, soft diffused glow, natural highlights on skin, dust motes in the light beams",
    },
    cozy_at_home: {
      scene: "a cozy living room with a plush velvet sofa, chunky knit blankets, flickering candles on a coffee table, string fairy lights, rain on the windows",
      outfit: "an oversized cashmere sweater in cream that slips off one shoulder, silk shorts, fuzzy socks, hair in a loose low bun, minimal gold jewelry",
      lighting: "warm candlelight mixed with soft fairy light glow, intimate amber tones, gentle shadows creating a cozy dreamy atmosphere",
    },
    pool_day: {
      scene: "a luxurious private villa pool surrounded by tropical palms and bougainvillea, turquoise water, sun loungers with white cushions, a cocktail with condensation",
      outfit: "a one-piece swimsuit in classic black with a deep scoop back and gold clasp detail, oversized sunglasses pushed up on head, a sheer sarong tied at the hip",
      lighting: "bright overhead tropical sun with strong shadows, sparkling water reflections dancing on skin, rich saturated colors, golden skin glow",
    },
    road_trip: {
      scene: "leaning against a vintage convertible on a scenic coastal highway, ocean views in the background, golden grass fields, open road stretching into the distance",
      outfit: "a cropped vintage band tee knotted at the waist over high-waisted denim cutoff shorts, cowboy boots, aviator sunglasses, wind-tousled hair",
      lighting: "warm late afternoon sun creating a sun-kissed look, lens flare from the low sun, warm golden tones with cool ocean blue in the background",
    },
    brunch: {
      scene: "a chic outdoor café terrace with wrought-iron furniture, fresh flowers on the table, artisan pastries and mimosas, a cobblestone European-style street",
      outfit: "a flowy floral midi dress in soft pastels with a sweetheart neckline, strappy heeled sandals, a straw clutch, delicate pearl earrings",
      lighting: "soft dappled sunlight through a woven overhead canopy, warm natural tones, gentle face shadows, bright and airy feel",
    },
  },
  themed: {
    fantasy_cosplay: {
      scene: "a mystical enchanted forest with bioluminescent flowers, ancient stone ruins covered in vines, ethereal mist hovering above the ground, magical floating particles of light",
      outfit: "an elaborate fantasy warrior princess costume with a fitted metallic corset in antique gold, a flowing sheer cape in deep purple, ornate arm cuffs and a crystal tiara",
      lighting: "ethereal blue-green bioluminescent glow mixed with warm golden light shafts breaking through the canopy, magical atmosphere with volumetric light",
    },
    retro_vintage: {
      scene: "a 1960s retro diner with chrome and red vinyl bar stools, a classic jukebox with neon glow, checkered floor tiles, vintage milkshake glasses",
      outfit: "a classic pin-up style high-waisted pencil skirt in cherry red with a fitted white halter top, red kitten heels, cat-eye sunglasses, vintage curled hair",
      lighting: "warm neon glow from the jukebox and diner signs, retro tungsten warmth, nostalgic film grain feel, saturated reds and warm yellows",
    },
    femme_fatale: {
      scene: "a dimly lit luxury penthouse with floor-to-ceiling city views at night, neon city lights reflecting on glass, dark moody furniture, a glass of red wine on a sleek table",
      outfit: "a figure-hugging black velvet dress with a low back, elbow-length satin gloves, stiletto heels, smoky eye makeup, hair in a sleek updo with tendrils framing her face",
      lighting: "dramatic noir-style lighting with strong side light and deep shadows, neon city reflections on glass, high contrast, cinematic moodiness",
    },
    angel: {
      scene: "a dreamy ethereal cloudscape studio set with billowing white fabric, soft feathers scattered on the ground, pearlescent backdrop, heavenly atmosphere",
      outfit: "a flowing white Grecian-style gown with draped fabric and gold accents, delicate gold leaf headpiece, barefoot, large realistic feathered angel wings in pristine white",
      lighting: "bright heavenly backlight creating a glowing halo effect, soft diffused front fill, pearlescent highlights, ethereal dreamy glow on skin",
    },
    goddess: {
      scene: "a grand ancient Greek temple with towering marble columns, golden sunset visible through the columns, rose petals scattered on stone floors, draped silk fabrics",
      outfit: "a luxurious gold-draped toga-style gown that clings and flows, gold leaf crown, gold cuff bracelets, gold strappy gladiator sandals, statement gold necklace",
      lighting: "rich warm sunset light pouring through the columns creating dramatic golden shafts, warm marble reflections, rich amber and gold tones throughout",
    },
  },
  fitness: {
    yoga_pose: {
      scene: "a serene outdoor yoga platform overlooking misty mountains at sunrise, natural wood deck, lush greenery surrounding, a meditation singing bowl nearby",
      outfit: "a seamless high-waisted yoga leggings in deep ocean blue with a matching sports bra, barefoot on a premium cork yoga mat, hair in a sleek high ponytail",
      lighting: "soft golden sunrise light from the horizon, misty atmospheric diffusion, warm rim light on her body, peaceful and serene ambiance",
    },
    gym_selfie: {
      scene: "a premium modern gym with full-length mirrors, matte-black equipment, LED strip lighting in the ceiling, rubber flooring, motivational neon signs",
      outfit: "a moisture-wicking charcoal sports bra with mesh panels and matching high-waisted compression leggings, sleek black training shoes, wireless earbuds, fitness tracker",
      lighting: "bright overhead LEDs with warm side accent lights, mirror reflections doubling the light sources, subtle perspiration sheen catching highlights",
    },
    post_workout: {
      scene: "a luxury gym locker room with clean modern tiles, steam rising from a nearby shower, a plush white towel on a wooden bench, a protein shake bottle",
      outfit: "a loose tank top slipping off one shoulder revealing a sports bra strap, shorts, hair damp and pulled back, a towel around her neck, dewy post-workout skin",
      lighting: "soft overhead diffused light mixed with warm steam-filtered glow, realistic perspiration highlights on skin, a clean fresh atmosphere",
    },
    stretching: {
      scene: "a minimalist dance studio with a ballet barre, full-wall mirror, polished wooden floor, large windows with natural light, clean white walls",
      outfit: "a body-hugging unitard in matte black with a deep scoop back, ballet-style flat shoes, hair in a neat bun, minimal stud earrings",
      lighting: "bright natural window light from one side creating long graceful shadows, clean reflected light from the mirror, emphasis on muscle definition and form",
    },
    dance: {
      scene: "a dramatic stage-like setting with spotlights, dark background, scattered confetti or glitter frozen mid-air, polished black floor reflecting light",
      outfit: "a sparkling sequined bodysuit in deep ruby red with a plunging neckline and long fringe detail that captures motion, strappy dance heels, hair mid-whip with dramatic flow",
      lighting: "dramatic stage spotlights creating strong directional beams, rim lighting from behind, dynamic shadows, confetti catching light like tiny stars",
    },
  },
  intimate: {
    silk_sheets: {
      scene: "a luxurious bedroom with a massive bed draped in champagne silk sheets and plush pillows, soft gauze canopy overhead, fresh roses on the nightstand",
      outfit: "a delicate silk chemise in blush pink with thin spaghetti straps and lace trim, lying on silk sheets, hair fanned out naturally on the pillow",
      lighting: "soft warm lamplight from one side creating intimate golden shadows, gentle highlights on silk fabric, dreamy romantic atmosphere, soft candlelit warmth",
    },
    mirror_selfie: {
      scene: "a glamorous walk-in closet with a full-length ornate gold mirror, designer items on shelves, soft ambient LED strip lighting, marble flooring",
      outfit: "a matching lace bralette and high-waisted thong set in classic black, an oversized blazer draped over her shoulders, pointed-toe mules, gold jewelry",
      lighting: "warm ambient LED closet lighting, mirror reflection creating depth, soft flattering tones, clean highlights on the lace texture and mirror frame",
    },
    bathrobe: {
      scene: "a luxury spa bathroom with a freestanding marble bathtub, candles arranged along the tub edge, eucalyptus stems in a vase, steam rising from hot water",
      outfit: "a plush white terry cloth bathrobe loosely tied at the waist revealing décolletage, hair wrapped in a towel turban, bare legs, natural dewy skin",
      lighting: "warm candlelight reflections on marble and water, soft steam-diffused glow, intimate and luxurious golden amber tones, relaxing spa atmosphere",
    },
    candlelit: {
      scene: "an intimate setting with dozens of flickering candles at various heights, sheer curtains billowing gently, a plush fur throw rug on dark hardwood, rose petals",
      outfit: "a satin slip dress in deep emerald green that clings to her curves, thin chain necklace, barefoot, hair in loose natural waves cascading over her shoulders",
      lighting: "entirely candlelit with warm flickering amber glow, deep romantic shadows, gentle highlights dancing on satin fabric, intimate and seductive mood",
    },
    getting_ready: {
      scene: "a Hollywood-style vanity setup with a large illuminated mirror surrounded by round bulbs, makeup brushes and products arranged neatly, a velvet stool",
      outfit: "a sheer lace-trimmed robe in dusty rose over matching lingerie, seated at the vanity applying lipstick, hair half-styled in loose curls, one leg crossed",
      lighting: "warm vanity bulb lighting creating glowing even illumination on her face, soft shadows behind her, glamorous Old Hollywood vibe, warm skin tones",
    },
  },
};

// ─── MOOD / POSE PRESETS ───
const POSE_PRESETS = {
  confident: "standing tall with weight on her back hip, chin lifted with quiet authority, one hand on her hip, shoulders open, direct powerful gaze into the lens",
  playful: "mid-laugh turning toward the camera with a genuine candid smile, one hand brushing hair behind her ear, body angled three-quarters with a playful head tilt",
  seductive: "leaning softly against the nearest surface with her back slightly arched, one hand tracing her collarbone, chin dipped with a slow smoldering half-lidded gaze",
  sultry: "body angled to show her silhouette, looking over her shoulder with parted lips and heavy-lidded eyes, one hand resting on her thigh, dramatic S-curve posture",
  dreamy: "gazing off into the distance with a soft wistful expression, head tilted gently, hands relaxed and natural, an ethereal faraway look in her eyes",
  fierce: "facing camera square-on with feet planted wide, jaw set, every muscle subtly engaged, eyes sharp and commanding directly at the lens with intense power",
};

// ─── ULTRA PHOTO-REALISM BLOCK ───
const REALISM_BLOCK = `Ultra photo-realistic image. Shot on a Canon EOS R5 with an 85mm f/1.4 portrait lens. Hyper-detailed skin texture with visible pores, natural skin imperfections, fine peach fuzz, micro oil sheen on high cheekbones, realistic undereye texture. Natural subsurface scattering on skin. Fabric textures rendered at fiber-level detail. Hair with individual strand separation and realistic light interaction. Precise catchlights in the eyes. Depth of field with natural bokeh. Professional color grading. 8K resolution quality. Do NOT generate cartoon, anime, illustration, painting, drawing, CGI, or 3D render. This MUST look like a real ultra-high-resolution photograph taken by a professional fashion photographer.`;

// ─── PROMPT BUILDER ───
function buildPrompt({ category, contentType, mood, aspectRatio, customPrompt }) {
  const cat = CONTENT_TYPES[category];
  if (!cat) return null;
  const ct = cat[contentType];
  if (!ct) return null;

  const pose = POSE_PRESETS[mood] || POSE_PRESETS.confident;
  const ratioLabel = aspectRatio === "9:16" ? "vertical portrait" : aspectRatio === "16:9" ? "horizontal landscape" : aspectRatio === "1:1" ? "square" : "portrait";

  return `A stunning full-body fashion photograph of a beautiful young woman. ${pose}. Scene: ${ct.scene}. She is wearing ${ct.outfit}. Lighting: ${ct.lighting}. ${REALISM_BLOCK}${customPrompt ? ` Additional details: ${customPrompt}.` : ""} ${aspectRatio} ${ratioLabel} composition.`;
}

// ─── API ROUTE ───
export async function POST(request) {
  try {
    const { modelImage, category, contentType, mood, aspectRatio, customPrompt, aiModel, imageQuality, apiKey: clientApiKey } = await request.json();

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it in .env.local or enter your API key." },
        { status: 500 }
      );
    }

    const prompt = buildPrompt({ category, contentType, mood, aspectRatio: aspectRatio || "9:16", customPrompt });
    if (!prompt) {
      return NextResponse.json({ error: "Invalid category or content type selected." }, { status: 400 });
    }

    console.log("\n🔥 CONTENT CREATOR PROMPT 🔥\n");
    console.log(prompt);
    console.log(`\nWord count: ${prompt.split(/\s+/).length}\n`);

    const ai = new GoogleGenAI({ apiKey });

    // Model selection: pro = Nano Banana Pro, flash = Nano Banana 2
    const MODEL_MAP = {
      pro: "gemini-3-pro-image-preview",
      flash: "gemini-3.1-flash-image-preview",
    };
    const MODEL = MODEL_MAP[aiModel] || MODEL_MAP.pro;

    // Build request parts — text prompt + optional model reference image
    const parts = [{ text: prompt }];

    if (modelImage) {
      // Extract base64 data from data URI
      const base64Match = modelImage.match(/^data:(.+);base64,(.+)$/);
      if (base64Match) {
        parts.unshift({
          text: "Use this reference image as the model/person. Generate a new image of this exact same person in the described scene, outfit, and pose. Maintain her facial features, body type, and overall appearance precisely.",
        });
        parts.splice(1, 0, {
          inlineData: {
            mimeType: base64Match[1],
            data: base64Match[2],
          },
        });
      }
    }

    const requestBody = {
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["image", "text"],
        imageConfig: { aspectRatio: aspectRatio || "9:16" },
      },
    };

    const response = await ai.models.generateContent({ model: MODEL, ...requestBody });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (!responseParts || responseParts.length === 0) {
      return NextResponse.json({ error: "No image was generated. Try different options." }, { status: 500 });
    }

    const imagePart = responseParts.find((part) => part.inlineData);
    if (!imagePart) {
      const textPart = responseParts.find((part) => part.text);
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
    console.error("Content creator generation error:", error);
    const status = error.status || error.httpStatusCode || 500;
    let message = error.message || "Failed to generate image.";
    if (status === 429) message = "Rate limit exceeded. Please wait a moment and try again.";
    else if (status === 400) message = `Invalid request: ${error.message}`;
    else if (message.toLowerCase().includes("safety")) message = "Image blocked by safety filters. Try a different content type or mood.";
    else if (message.toLowerCase().includes("quota")) message = "API quota exceeded. Please check your billing or try later.";
    return NextResponse.json({ error: message }, { status });
  }
}
