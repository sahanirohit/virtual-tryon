import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────
// 6-VARIABLE CINEMATIC PROMPT ENGINE
// ─────────────────────────────────────────────────────────

// ── 1. SUBJECT (constant — consistent character identity) ──
const SUBJECT = {
  base: "A 21-year-old Indian female fashion model with a curvy yet athletic hourglass figure and toned, sculpted build",
  face: "soft symmetrical features with expressive almond-shaped doe eyes, defined cheekbones, a delicate nose, and full natural lips with subtle nude tint",
  skin: "fair wheatish-warm Indian complexion with visible pores and fine micro-texture across her forehead and cheeks, natural oil sheen only on the high points of her cheekbones and the bridge of her nose while the rest of her skin remains naturally matte, no symmetry correction, no retouching, no smoothing, no beauty filters, skin appears healthy alive and dimensional with natural imperfections fully preserved, luminous only from real light interaction",
};

// ── 2. CAMERA PRESETS (per theme) ──
const CAMERA_PRESETS = {
  beach:   { device: "Sony A7 IV",         angle: "slightly low-angle",     lens: "35mm wide portrait lens",  framing: "full-body vertical composition" },
  studio:  { device: "Canon EOS R5",       angle: "eye-level",              lens: "85mm portrait lens",       framing: "full-body vertical composition" },
  urban:   { device: "Fujifilm X-T5",      angle: "eye-level",              lens: "50mm street lens",         framing: "full-body vertical composition" },
  gym:     { device: "Sony A7 IV",         angle: "slightly low-angle",     lens: "24mm wide-angle lens",     framing: "full-body vertical composition" },
  cafe:    { device: "Canon EOS R5",       angle: "slightly elevated",      lens: "50mm portrait lens",       framing: "medium-to-full body composition" },
  rooftop: { device: "ARRI Alexa Mini",    angle: "eye-level",              lens: "35mm cinematic lens",      framing: "full-body vertical composition" },
  garden:  { device: "Nikon Z8",           angle: "slightly low-angle",     lens: "85mm portrait lens",       framing: "full-body vertical composition" },
  fashion: { device: "Phase One IQ4 150MP",angle: "eye-level",              lens: "105mm medium-telephoto",   framing: "full-body vertical composition" },
};

// ── 3. POSE / ACTION PRESETS (per mood) ──
const POSE_PRESETS = {
  confident: "She stands tall with weight shifted onto her back hip, one leg slightly forward, chin lifted with quiet authority, one hand resting on her hip and the other relaxed at her side with fingers barely grazing her thigh, shoulders open and squared, gaze locked directly past the lens with grounded self-assurance",
  playful:   "She is mid-stride turning her head back toward the camera with a genuine candid laugh, one arm swinging naturally and the other lightly brushing her hair behind her ear, weight caught between steps creating a sense of effortless movement, her body angled three-quarters to the lens with a playful tilt of her head",
  seductive: "She leans softly against the nearest surface with her back slightly arched, one hand tracing along her collarbone and the other resting low on her hip, weight on one leg with the opposite knee bent inward, her chin dipped slightly and her eyes delivering a slow smoldering half-lidded gaze toward the lens",
  elegant:   "She stands in a poised classical contrapposto with one foot placed delicately ahead of the other, both hands relaxed at her sides with wrists softly turned outward, her spine elongated and shoulders drawn back with effortless grace, her gaze cast slightly downward past the camera with a serene composed expression",
  fierce:    "She faces the camera square-on with feet planted shoulder-width apart, both arms at her sides with fists loosely clenched, jaw set and nostrils barely flared, every muscle subtly engaged creating visual tension, her eyes sharp and unwavering aimed directly into the lens with commanding intensity",
  candid:    "She is caught in a genuine unposed moment looking away from the camera, one hand mid-gesture adjusting her earring or tucking hair, her weight shifting naturally as though unaware of being photographed, body angled away from the lens with her profile softly illuminated creating an authentic lifestyle feel",
};

// ── 4. ENVIRONMENT PRESETS (6 layers each) ──
const ENVIRONMENT_PRESETS = {
  beach: {
    location: "a pristine tropical beach on the western Indian coastline during late afternoon",
    architecture: "a weathered wooden beach shack with thatched palm-frond roof visible in the far background",
    decorative: "woven jute beach mats and a pair of abandoned leather sandals near the waterline",
    furnishings: "a low driftwood bench draped with a faded linen throw",
    organic: "soft white coral sand underfoot transitioning to clear turquoise shallows with gentle foam lapping the shore and scattered frangipani petals",
    atmosphere: "warm golden-hour haze with salt mist diffusing the horizon line and heat shimmer rising from the sand creating layered atmospheric depth",
  },
  studio: {
    location: "a high-end professional photography studio in a converted industrial loft",
    architecture: "exposed concrete walls with matte-sealed finish and polished concrete floor reflecting subtle ambient light",
    decorative: "a single large matte-white V-flat reflector angled off to the left and a silver bounce card on the right",
    furnishings: "a minimalist acrylic stool positioned off-center and a seamless neutral grey paper backdrop sweeping from wall to floor",
    organic: "negative space dominating the composition with clean shadow gradients and no distractions",
    atmosphere: "controlled studio atmosphere with zero ambient color cast and precision-placed fill light creating a dimensional shadowplay against the backdrop",
  },
  urban: {
    location: "a trendy upscale district street in South Mumbai during magic hour",
    architecture: "Art Deco heritage buildings with ornamental balconies flanking the street alongside modern glass-front boutiques",
    decorative: "vintage wrought-iron street lamps casting warm pools of light and hand-painted cafe signs",
    furnishings: "a parked matte-black luxury sedan with chrome trim reflecting the neon glow and a cafe terrace with minimalist metal chairs",
    organic: "rain-dampened asphalt reflecting city lights in oil-slick rainbow streaks and a stray bougainvillea vine cascading over a compound wall",
    atmosphere: "urban twilight with layered bokeh from neon signage headlights and distant traffic creating cinematic street depth and a faint warm smog haze diffusing the background",
  },
  gym: {
    location: "a premium modern fitness studio with floor-to-ceiling windows overlooking a city skyline",
    architecture: "industrial-chic exposed steel beams matte-black painted walls and rubberized dark flooring with subtle grid lines",
    decorative: "a wall-mounted motivational light-box sign reading STRENGTH in minimal sans-serif and a rack of chrome dumbbells organized by weight",
    furnishings: "a flat workout bench with black leather padding and a coiled battle rope on the floor beside a kettlebell",
    organic: "faint condensation on the window glass and a single green potted snake plant in the corner",
    atmosphere: "bright overhead LED panels mixed with warm side-light from the windows creating a dynamic contrast between the cool interior and warm exterior glow with visible dust particles in the light shafts",
  },
  cafe: {
    location: "an intimate artisan café with bohemian aesthetic in a heritage Pondicherry building",
    architecture: "whitewashed colonial walls with arched doorways exposed terracotta ceiling beams and vintage checkered floor tiles",
    decorative: "a hand-lettered chalkboard menu framed vintage botanical prints and a shelf of mismatched ceramic mugs",
    furnishings: "a small round marble-top bistro table with a latte in a handmade ceramic cup and a worn leather-bound journal beside it and a bentwood café chair with woven cane seat",
    organic: "trailing pothos vines hanging from a macramé planter and a small vase of dried eucalyptus on the windowsill with warm afternoon light streaming through sheer linen curtains",
    atmosphere: "warm amber interior light mixing with soft natural window light creating gentle cross-shadows and a dreamy nostalgic depth with visible dust motes floating in the sunbeams",
  },
  rooftop: {
    location: "a luxury high-rise rooftop terrace overlooking a sprawling metropolitan skyline at golden hour",
    architecture: "sleek glass balustrade with brushed steel railing and polished stone deck tiles reflecting the warm sky",
    decorative: "a cascading string of warm Edison bulb lights strung between minimal steel posts and a concrete planter with ornamental grasses",
    furnishings: "a low-profile outdoor daybed with cream linen cushions and a geometric brass side table holding a cocktail glass with condensation droplets",
    organic: "the distant skyline silhouetted against a gradient sky shifting from amber to coral to soft lavender with cirrus clouds streaked across the horizon",
    atmosphere: "rich golden-hour warmth with the sun low on the horizon casting long shadows across the deck and a gentle warm breeze implied by the sway of the grasses and the model's hair creating cinematic romance and atmospheric depth",
  },
  garden: {
    location: "a lush heritage Mughal-inspired garden in the early morning golden light",
    architecture: "a sandstone archway with intricate jali lattice work framing the background and a stepped stone pathway",
    decorative: "hand-painted blue-and-white ceramic pots lining the path and a brass birdbath partially hidden by foliage",
    furnishings: "a carved stone bench with moss growing in its crevices and a discarded woven straw hat resting on one end",
    organic: "blooming jasmine creepers climbing the archway beds of magenta bougainvillea and white frangipani with dew-kissed rose bushes and scattered petals on the pathway",
    atmosphere: "early morning dappled sunlight filtering through dense canopy creating dancing shadow-light patterns across the ground and the model with a faint mist lingering at ankle height giving the scene an ethereal dreamlike depth",
  },
  fashion: {
    location: "a dramatic high-fashion editorial set in a grand minimalist gallery space",
    architecture: "soaring double-height white walls with a single oversized rectangular window casting a geometric light shaft across the polished marble floor",
    decorative: "a large-scale abstract oil painting in muted earth tones leaning against the far wall and a single sculptural chrome vase",
    furnishings: "a velvet upholstered modernist chaise longue in deep emerald and a tall brushed-brass floor lamp with no shade casting a bare warm bulb glow",
    organic: "a single dramatic stem of dried pampas grass in the chrome vase and the faint grain of the marble floor adding organic texture",
    atmosphere: "dramatic editorial lighting with a single strong key light creating a sharp diagonal shadow across the floor and the model with deep contrast and a moody cinematic atmosphere amplified by the vast negative space of the gallery",
  },
};

// ── 5. HAIR PRESETS (per theme) ──
const HAIR_PRESETS = {
  beach:   "Her long waist-length hair is a deep natural black-brown with subtle warm chestnut undertones, worn in loose salt-textured beach waves that move freely with the breeze, individual strands catching the golden backlight and glowing with a translucent amber halo at the edges",
  studio:  "Her long mid-back-length hair is a rich jet-black with a healthy blue-black sheen under the studio lights, straightened to a sleek polished finish with feathered ends, each strand reflecting the controlled lighting as clean linear highlights running from crown to tip",
  urban:   "Her shoulder-length hair is a dark espresso-brown with natural volume and a soft blowout wave, parted slightly off-center and tucked behind one ear revealing a delicate gold ear cuff, the city neon reflects faintly in the glossy surface of her hair",
  gym:     "Her long dark black hair is pulled back into a high sleek athletic ponytail with a clean side part, the tail catching the overhead light in a smooth arc, a few intentional face-framing wisps softening the look around her temples and jawline",
  cafe:    "Her medium-length dark hair falls in soft romantic curls past her collarbones, a warm dark-brown tone with natural lighter highlights around the face that catch the warm window light, loosely pinned on one side with a minimalist gold hair clip",
  rooftop: "Her long flowing hair is a deep warm brown-black with golden sunset highlights shimmering throughout, styled in voluminous soft blown-out layers that cascade over one shoulder, the setting sun backlighting individual strands into fine threads of molten gold",
  garden:  "Her long hip-length hair is a natural dark brown-black with dew-caught highlights, worn in a loose romantic braid woven with a tiny sprig of fresh jasmine, soft face-framing tendrils curling naturally from the humidity and catching the dappled sunlight",
  fashion: "Her long mid-back-length hair is an intense blue-black with a high-gloss editorial finish, swept into a dramatic side-part cascade falling over one shoulder in controlled sculptural waves, every strand precision-placed to create graphic shadow lines against her neck and collarbone",
};

// ── 6. OUTFIT PRESETS (layered: garment + footwear + accessories) ──
const OUTFIT_PRESETS = {
  casual: {
    garment: "a fitted ribbed-knit ivory crop top with cap sleeves showing her toned midriff paired with high-waisted straight-leg medium-wash denim jeans with a raw distressed hem",
    footwear: "clean white leather low-top sneakers with minimal stitching and a gum sole",
    accessories: "a dainty layered gold chain necklace with a tiny sun pendant, small gold hoop earrings, a slim leather-strap watch on her left wrist, and a crossbody micro-bag in soft tan pebbled leather",
  },
  ethnic: {
    garment: "a luxurious hand-woven silk saree in deep royal teal with intricate gold zari border and pallu featuring traditional paisley motifs draped elegantly in Nivi style over a fitted gold raw-silk blouse with delicate mirror-work embroidery and a sweetheart neckline",
    footwear: "handcrafted gold leather juttis with floral threadwork embroidery",
    accessories: "a statement polki kundan choker necklace with emerald drops, matching jhumka earrings with pearl danglers, a stack of thin gold bangles on each wrist, a gold maang tikka centered on her forehead, and a delicate gold nose ring with a fine chain connecting to her earring",
  },
  bikini: {
    garment: "a fashion-forward high-cut halter-neck bikini top and matching Brazilian bottoms in a rich terracotta burnt-orange ribbed textured fabric with thin gold ring hardware at the center and the hip ties",
    footwear: "barefoot on warm sand with a delicate gold anklet chain on her left ankle",
    accessories: "oversized tortoiseshell acetate sunglasses pushed up on her head, a woven natural raffia tote bag resting nearby, layered gold body chains draped at her waist, and a waterproof gold cuff bracelet",
  },
  gym: {
    garment: "a moisture-wicking charcoal-black sports bra with geometric mesh panels and racerback straps paired with high-waisted seamless compression leggings in matching charcoal with a subtle jacquard pattern and a wide supportive waistband",
    footwear: "sleek performance running shoes in matte black and neon coral with Flyknit uppers and a responsive foam sole",
    accessories: "wireless matte-black sport earbuds, a slim black digital fitness tracker on her left wrist, a small silicone hair tie on her right wrist, and a drawstring gym sack in grey ripstop nylon slung over one shoulder",
  },
  party: {
    garment: "a body-hugging sequined mini dress in deep champagne gold with a plunging V-neckline and thin spaghetti straps, the sequins catching light in shifting patterns across every curve, the fabric skimming her figure from bust to mid-thigh with a subtle slit on the left side",
    footwear: "strappy metallic gold stiletto heels with a delicate ankle strap and pointed toe",
    accessories: "a crystal-encrusted clutch in matching champagne, dangling diamond-cut statement earrings that catch the light with every movement, a cocktail ring with a large smoky topaz stone on her right hand, and a fine gold cuff on her upper left arm",
  },
  jeans: {
    garment: "a tucked-in oversized vintage-wash denim shirt tied in a knot at her waist over a fitted black lace-trimmed camisole paired with skin-tight high-waisted black skinny jeans with a clean tailored leg",
    footwear: "pointed-toe block-heel ankle boots in smooth black leather with a polished silver zip detail",
    accessories: "a wide brown leather belt with an antique brass buckle, layered thin gold pendant necklaces of varying lengths, tortoiseshell rectangular sunglasses hooked into her neckline, and a structured tan leather shoulder bag with gold hardware",
  },
  business: {
    garment: "a tailored double-breasted blazer in dove-grey premium wool with peak lapels and functional horn buttons over a tucked-in cream silk charmeuse blouse with a subtle sheen and a soft bow neckline paired with slim-fit high-waisted ankle-length trousers in matching grey with a pressed center crease",
    footwear: "nude patent-leather pointed-toe pumps with a stiletto heel and red sole detail",
    accessories: "a structured black leather briefcase-style tote with minimal gold hardware, pearl stud earrings, a slim gold bangle watch, and a silk pocket square in pale blush peeking from the blazer breast pocket",
  },
  lingerie: {
    garment: "an elegant French-lace bralette in deep burgundy wine with scalloped edges and delicate floral lace patterns showing intricate craftsmanship paired with matching high-waisted lace briefs with sheer mesh side panels and satin ribbon trim at the waist",
    footwear: "barefoot standing on plush ivory shag carpet",
    accessories: "a fine gold body chain draped from her neck down her sternum, small diamond stud earrings, a silk robe in champagne gold draped loosely off one shoulder and pooling around her elbows, and a delicate gold anklet",
  },
};

// ── 7. LIGHTING PRESETS (7 details per theme) ──
const LIGHTING_PRESETS = {
  beach: {
    time: "Late afternoon golden hour approximately one hour before sunset",
    quality: "warm soft natural sunlight diffused through thin coastal haze",
    direction: "strong backlight from the low sun behind her with soft fill bounce from the sand below",
    colorTone: "rich warm amber and honey tones with cool blue-teal in the ocean shadows",
    shadows: "long soft-edged shadows stretching forward with gentle translucency at the edges",
    highlights: "hot specular highlights on wet skin and water droplets with an overall golden skin glow",
    effects: "strong golden rim light outlining her silhouette and hair, lens flare from the low sun, and light caustics dancing on her skin reflected from the water surface",
  },
  studio: {
    time: "Controlled timeless studio environment with no ambient daylight",
    quality: "crisp clean professional strobe light with precision modifiers",
    direction: "45-degree key light from upper left with a large softbox creating wraparound illumination and a subtle backlight kicker on the right",
    colorTone: "neutral true-white light with no color cast maintaining accurate skin tones",
    shadows: "defined but soft-edged shadows with a 3:1 lighting ratio creating gentle dimension",
    highlights: "clean controlled highlights on the cheekbones forehead and collarbone with no blown areas",
    effects: "subtle hair light separating her from the background, a faint reflection on the polished floor, and precise catchlights in both eyes",
  },
  urban: {
    time: "Twilight blue hour transitioning from dusk to early night",
    quality: "mixed ambient lighting combining the last traces of natural sky glow with warm artificial city light",
    direction: "overhead and side-mixed directional light from street lamps and neon signs with soft ambient fill from the twilight sky",
    colorTone: "cool blue-purple twilight mixed with warm amber street lamp pools and occasional neon pink and teal reflections",
    shadows: "dramatic deep shadows in doorways and alleys with sharp-edged shadows from direct street lamp overhead light",
    highlights: "wet reflective highlights on rain-dampened surfaces and specular neon reflections on glass and metal",
    effects: "cinematic neon rim light on one side of her face, layered bokeh orbs from distant traffic and signage, and faint light trails from passing vehicles",
  },
  gym: {
    time: "Mid-morning with bright overhead artificial lights and natural side window light",
    quality: "bright high-CRI overhead LED panels mixed with warm directional window sunlight from the right",
    direction: "strong overhead key light with warm side fill from the large windows creating a dual-source setup",
    colorTone: "cool white overhead mixed with warm golden-amber window light creating a warm-cool contrast across her body",
    shadows: "defined shadows under her cheekbones chin and arm muscles emphasizing athletic definition with a slightly hard edge from the overhead source",
    highlights: "a sheen of perspiration catching the overhead light as bright micro-highlights across her shoulders deltoids and collarbones",
    effects: "visible light shafts from the windows with dust particles floating in the beams, a subtle warm rim on her right side from the window, and reflected chrome highlights from nearby equipment",
  },
  cafe: {
    time: "Mid-afternoon with warm sunlight streaming through west-facing windows",
    quality: "soft warm natural sunlight diffused through sheer linen curtains creating a gentle dreamy wrap",
    direction: "side window light from the left creating gentle cross-lighting with soft warm ambient bounce from the whitewashed walls",
    colorTone: "warm honey-amber tones dominating with soft creamy whites and gentle warm shadows",
    shadows: "delicate soft-edged shadows with minimal contrast creating a flat but dimensional warmth",
    highlights: "gentle warm glow on her skin with soft catch-lights in her eyes and a subtle specular reflection on the ceramic cup",
    effects: "visible dust motes floating in the sunbeams, soft window-frame shadow patterns on the wall behind her, and a warm halo glow around her hair backlit by the window",
  },
  rooftop: {
    time: "Golden hour with the sun exactly at the horizon line creating peak warmth",
    quality: "intense warm directional sunlight with the last concentrated rays of the day",
    direction: "strong direct backlight from the setting sun behind her with warm reflected fill bouncing from the light stone deck below",
    colorTone: "deep saturated amber gold and burnt-orange with the sky gradient shifting through coral rose and soft violet",
    shadows: "extremely long dramatic shadows extending forward with warm translucent edges and a golden glow in the shadow regions from the sky fill",
    highlights: "intense golden rim light blazing along her silhouette shoulders and arms with specular highlights on the glass balustrade and condensation on the cocktail glass",
    effects: "dramatic solar rim glow outlining her entire figure, subtle lens flare streaks from the direct sun, and warm light scatter in the atmosphere creating a romantic dreamy haze",
  },
  garden: {
    time: "Early morning within the first hour after sunrise",
    quality: "soft diffused morning sunlight filtered through dense tree canopy creating dappled patterns",
    direction: "overhead and slightly behind filtering through leaves creating top-down speckled illumination with gentle ambient fill from the misty surroundings",
    colorTone: "fresh cool green-tinged light mixing with warm golden sun patches creating a vibrant natural palette",
    shadows: "intricate organic shadow patterns from the leaf canopy dancing across her body and the ground with soft feathered edges",
    highlights: "bright sun spots breaking through the leaves illuminating specific areas of her skin and outfit in concentrated warm patches",
    effects: "volumetric light shafts visible through the morning mist, sparkling dew drops on petals catching the sun like tiny lenses, and a soft green ambient glow bouncing from the surrounding foliage onto her skin",
  },
  fashion: {
    time: "Timeless editorial studio environment with dramatic controlled lighting",
    quality: "a single powerful hard key light with minimal fill creating high-contrast editorial drama",
    direction: "strong directional key light from the upper right cutting a sharp diagonal across the space with almost no fill on the shadow side",
    colorTone: "neutral-to-warm focused light with deep rich shadows and no ambient color contamination",
    shadows: "deep dramatic opaque shadows with hard defined edges creating bold geometric shapes across the floor and the model",
    highlights: "intense concentrated highlights on the lit side with sharp falloff creating a chiaroscuro effect on her face and body",
    effects: "a dramatic diagonal shadow line cutting across the floor and walls, subtle warm glow from the bare-bulb floor lamp in the background, and razor-sharp catchlights in her eyes reflecting the single light source",
  },
};

// ── 8. MEDIUM / STYLE PRESETS (per theme) ──
const STYLE_PRESETS = {
  beach:   { style: "lifestyle influencer editorial", aesthetic: "coastal luxury bohemian", realism: "photorealistic with natural color grading and film-like warmth" },
  studio:  { style: "high-end portrait editorial",    aesthetic: "modern luxury minimalism", realism: "hyper-photorealistic with clinical precision and true color accuracy" },
  urban:   { style: "cinematic street editorial",      aesthetic: "contemporary urban luxury", realism: "photorealistic with cinematic color grading and film grain texture" },
  gym:     { style: "athletic lifestyle editorial",    aesthetic: "modern performance luxury", realism: "photorealistic with sharp detail and high dynamic range" },
  cafe:    { style: "warm lifestyle editorial",        aesthetic: "bohemian nostalgic comfort", realism: "photorealistic with vintage warmth and soft organic tones" },
  rooftop: { style: "cinematic golden-hour editorial", aesthetic: "romantic urban luxury",     realism: "photorealistic with rich saturated warmth and painterly bokeh" },
  garden:  { style: "ethereal nature editorial",       aesthetic: "romantic botanical luxury",  realism: "photorealistic with dreamy soft tonality and natural vibrancy" },
  fashion: { style: "high-fashion runway editorial",   aesthetic: "avant-garde minimal luxury", realism: "hyper-photorealistic with dramatic contrast and fine-art print quality" },
};

// ── TEXTURE BLOCK (per outfit category) ──
function getTextureBlock(outfit) {
  const base = "Her skin texture is rendered with absolute photographic realism showing visible pores on her nose and cheeks, natural undereye texture, and organic tonal variation across different areas of her body.";
  const textures = {
    casual:   `${base} The ribbed-knit fabric of her crop top shows each individual rib with slight pilling at the seams, the denim has authentic faded whiskering at the thighs and a visible warp-and-weft weave, her leather bag shows natural grain and a softly worn patina, and the gold jewelry catches micro-reflections with realistic metallic luster.`,
    ethnic:   `${base} The silk saree fabric shimmers with a dimensional liquid sheen changing color subtly as it drapes, the gold zari border has raised metallic thread texture catching light along every fold, the polki kundan stones show authentic irregular facets and warm internal glow, and the mirror-work on her blouse creates tiny scattered reflections across her neckline.`,
    bikini:   `${base} The ribbed bikini fabric shows individual textured ridges catching small shadow lines between each rib, the gold ring hardware has a polished reflective surface with a faint brushed texture, the raffia tote shows natural straw weave variation, and the body chain links are individually defined with smooth metallic surfaces catching sun flares.`,
    gym:      `${base} The compression fabric shows a subtle jacquard pattern with slight sheen variation between matte and micro-glossy zones, the mesh panels reveal the layered fabric construction beneath, her sneakers show the Flyknit weave pattern with individual thread resolution, and a light sheen of perspiration on her skin adds dimensional realism.`,
    party:    `${base} Every individual sequin on her dress is rendered as a separate reflective disc catching light at different angles creating a shimmering mosaic effect, the metallic heel straps show polished gold with fine scratches from wear, the crystal clutch facets fragment the light into tiny rainbow prisms, and the statement earrings catch sharp focused reflections.`,
    jeans:    `${base} The vintage-wash denim shirt fabric shows authentic soft fading at the folds and collar, the lace trim on her camisole reveals delicate individual thread patterns, the black leather of her boots has a smooth polished surface with natural creasing at the ankle, and the antique brass belt buckle shows aged patina with worn edges.`,
    business: `${base} The premium wool blazer shows fine herringbone micro-weave visible up close with precision-pressed lapel edges, the silk charmeuse blouse catches light with a liquid-smooth sheen, the patent-leather pumps reflect the environment in their mirror-like surface, and the pearl stud earrings have a soft iridescent nacre glow.`,
    lingerie: `${base} The French lace fabric shows intricate floral patterns with individual thread-work visible including tiny scalloped edge details, the sheer mesh panels reveal subtle skin texture beneath the fabric, the satin ribbon trim has a smooth directional sheen, and the champagne silk robe fabric pools in soft luminous folds catching warm light along every drape.`,
  };
  return textures[outfit] || textures.casual;
}

// ── LENS / DISTORTION FEEL ──
function getLensBlock(theme) {
  const presets = {
    beach:   "The 35mm lens produces a natural wide perspective with minimal barrel distortion keeping her body proportions true to life while capturing the expansive beach surroundings with gentle depth compression in the background.",
    studio:  "The 85mm portrait lens delivers beautiful natural compression with creamy bokeh separation from the backdrop, maintaining perfectly accurate body proportions with flattering perspective and zero wide-angle distortion.",
    urban:   "The 50mm lens replicates the natural human field of view creating an immersive street-level perspective with realistic depth layering and natural background compression that keeps architectural lines straight.",
    gym:     "The 24mm wide-angle lens captures the full gym environment with subtle wide-angle energy and slight barrel curvature at the extreme edges while keeping her centered figure proportionally accurate.",
    cafe:    "The 50mm lens renders the cozy interior with natural perspective and soft background blur that gently separates her from the café details without over-compression, maintaining the intimate spatial feel.",
    rooftop: "The 35mm cinematic lens captures both the model and the sweeping skyline with a natural wide perspective, slight vignetting at the corners, and a cinematic depth-of-field roll-off from sharp foreground to soft horizon.",
    garden:  "The 85mm portrait lens compresses the layered garden foliage behind her into a lush painterly bokeh of blurred color and light spots while keeping her in tack-sharp focus with beautiful subject-background separation.",
    fashion: "The 105mm medium-telephoto lens produces strong compression that flattens the background into a graphic abstract plane, eliminates all wide-angle distortion, and renders her figure with perfectly proportioned editorial flatness.",
  };
  return presets[theme] || presets.studio;
}


// ── PROMPT BUILDER (assembles cinematic paragraph) ──
function buildCinematicPrompt({ theme, outfit, mood, aspectRatio, customPrompt }) {
  const cam = CAMERA_PRESETS[theme] || CAMERA_PRESETS.studio;
  const env = ENVIRONMENT_PRESETS[theme] || ENVIRONMENT_PRESETS.studio;
  const pose = POSE_PRESETS[mood] || POSE_PRESETS.confident;
  const hair = HAIR_PRESETS[theme] || HAIR_PRESETS.studio;
  const outfitData = OUTFIT_PRESETS[outfit] || OUTFIT_PRESETS.casual;
  const light = LIGHTING_PRESETS[theme] || LIGHTING_PRESETS.studio;
  const styleData = STYLE_PRESETS[theme] || STYLE_PRESETS.studio;
  const textureBlock = getTextureBlock(outfit);
  const lensBlock = getLensBlock(theme);

  const ratioLabel = aspectRatio === "9:16" ? "vertical" : aspectRatio === "16:9" ? "horizontal landscape" : aspectRatio === "1:1" ? "square" : "portrait";
  const shotScale = "full-body fashion shot";

  const prompt = `${SUBJECT.base}, ${SUBJECT.face}, with ${SUBJECT.skin}. Shot on a ${cam.device} at ${cam.angle} using a ${cam.lens} in a ${cam.framing}. ${pose}. She is set in ${env.location}, framed by ${env.architecture}, with ${env.decorative} adding contextual detail. ${env.furnishings} anchor the composition while ${env.organic} bring the scene to life. ${env.atmosphere}. ${hair}. She is wearing ${outfitData.garment}, on her feet ${outfitData.footwear}, accessorized with ${outfitData.accessories}. The lighting is ${light.time} with ${light.quality} coming from ${light.direction}. The color palette leans into ${light.colorTone} with ${light.shadows} defining depth and ${light.highlights} drawing the eye. ${light.effects} complete the lighting story. ${textureBlock} ${lensBlock} The overall visual style is ${styleData.style} with a ${styleData.aesthetic} aesthetic rendered in ${styleData.realism}.${customPrompt ? ` ${customPrompt}.` : ""} ${aspectRatio} ${ratioLabel} ${shotScale}. Do NOT generate cartoon, anime, illustration, painting, drawing, or 3D render. This must look like a real ultra-high-resolution photograph.`;

  return prompt;
}


// ── API ROUTE ──
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

    const prompt = buildCinematicPrompt({ theme, outfit, mood, aspectRatio: aspectRatio || "9:16", customPrompt });

    // Log the prompt for debugging (remove in production)
    console.log("\n✨ CINEMATIC PROMPT ✨\n");
    console.log(prompt);
    console.log(`\nWord count: ${prompt.split(/\s+/).length}\n`);

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
