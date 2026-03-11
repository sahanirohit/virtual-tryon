"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";

const THEMES = [
  { id: "beach", label: "🏖️ Beach", description: "Sun-kissed beach vibes" },
  { id: "studio", label: "📸 Studio", description: "Clean studio portrait" },
  { id: "urban", label: "🌆 Urban", description: "City street chic" },
  { id: "gym", label: "💪 Gym", description: "Fitness & athletic wear" },
  { id: "cafe", label: "☕ Café", description: "Cozy café aesthetic" },
  { id: "rooftop", label: "🌇 Rooftop", description: "Golden hour rooftop" },
  { id: "garden", label: "🌿 Garden", description: "Lush garden blooms" },
  { id: "fashion", label: "👠 Fashion", description: "High fashion editorial" },
];

const OUTFITS = [
  { id: "casual", label: "Casual" },
  { id: "ethnic", label: "Ethnic / Saree" },
  { id: "bikini", label: "Bikini / Swimwear" },
  { id: "gym", label: "Gym Wear" },
  { id: "party", label: "Party Dress" },
  { id: "jeans", label: "Jeans & Top" },
  { id: "business", label: "Business Chic" },
  { id: "lingerie", label: "Lingerie" },
];

const MOODS = [
  { id: "confident", label: "😎 Confident" },
  { id: "playful", label: "😄 Playful" },
  { id: "seductive", label: "🔥 Seductive" },
  { id: "elegant", label: "✨ Elegant" },
  { id: "fierce", label: "⚡ Fierce" },
  { id: "candid", label: "📷 Candid" },
];

const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16", desc: "Portrait" },
  { value: "1:1", label: "1:1", desc: "Square" },
  { value: "4:5", label: "4:5", desc: "Instagram" },
  { value: "16:9", label: "16:9", desc: "Landscape" },
];

export default function InfluencerPage() {
  const router = useRouter();
  const { apiKey } = useApiKey();

  const [selectedTheme, setSelectedTheme] = useState("studio");
  const [selectedOutfit, setSelectedOutfit] = useState("casual");
  const [selectedMood, setSelectedMood] = useState("confident");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("influencer-gallery");
      if (saved) setGallery(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveToGallery = (imageUrl) => {
    const newItem = {
      id: Date.now().toString(),
      image: imageUrl,
      theme: selectedTheme,
      outfit: selectedOutfit,
      mood: selectedMood,
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...gallery];
    setGallery(updated);
    try {
      localStorage.setItem("influencer-gallery", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          outfit: selectedOutfit,
          mood: selectedMood,
          aspectRatio,
          customPrompt,
          apiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      const url = `data:${data.mimeType};base64,${data.image}`;
      setGeneratedImage(url);
      saveToGallery(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imgUrl) => {
    const link = document.createElement("a");
    link.href = imgUrl || generatedImage;
    link.download = `riya-influencer-${Date.now()}.png`;
    link.click();
  };

  const handleSendToTryon = (imgUrl) => {
    localStorage.setItem("vto-confirmed-model", imgUrl || generatedImage);
    router.push("/tryon");
  };

  const handleDeleteGallery = (id) => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    try {
      localStorage.setItem("influencer-gallery", JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="influencer-page">
      {/* Page Header */}
      <div className="influencer-header">
        <div className="influencer-header-text">
          <h1 className="influencer-title">
            <span className="influencer-title-gradient">AI Influencer</span> Generator
          </h1>
          <p className="influencer-subtitle">
            Generate stunning photos of Riya — your curvy, athletic Indian influencer ✨
          </p>
        </div>
        <div className="influencer-badge">
          <span className="influencer-badge-dot" />
          AI Powered
        </div>
      </div>

      <div className="influencer-layout">
        {/* Left Panel: Controls */}
        <div className="influencer-controls">
          {/* Character Card */}
          <div className="character-card">
            <div className="character-avatar">
              <div className="character-avatar-ring">
                <span className="character-avatar-icon">👩🏻</span>
              </div>
            </div>
            <div className="character-info">
              <h3 className="character-name">Riya</h3>
              <p className="character-desc">18-22 yr • Indian • Fair Skin</p>
              <div className="character-tags">
                <span className="character-tag">Curvy</span>
                <span className="character-tag">Athletic</span>
                <span className="character-tag">Cute Face</span>
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="control-section">
            <label className="control-label">📍 Scene / Location</label>
            <div className="theme-grid">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-btn ${selectedTheme === theme.id ? "active" : ""}`}
                  onClick={() => setSelectedTheme(theme.id)}
                  title={theme.description}
                >
                  <span className="theme-btn-label">{theme.label}</span>
                  <span className="theme-btn-desc">{theme.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Selector */}
          <div className="control-section">
            <label className="control-label">👗 Outfit Style</label>
            <div className="outfit-chips">
              {OUTFITS.map((o) => (
                <button
                  key={o.id}
                  className={`outfit-chip ${selectedOutfit === o.id ? "active" : ""}`}
                  onClick={() => setSelectedOutfit(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="control-section">
            <label className="control-label">💫 Mood & Expression</label>
            <div className="mood-grid">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  className={`mood-btn ${selectedMood === m.id ? "active" : ""}`}
                  onClick={() => setSelectedMood(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="control-section">
            <label className="control-label">📐 Aspect Ratio</label>
            <div className="ratio-row">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  className={`ratio-btn ${aspectRatio === r.value ? "active" : ""}`}
                  onClick={() => setAspectRatio(r.value)}
                >
                  <span className="ratio-btn-val">{r.label}</span>
                  <span className="ratio-btn-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="control-section">
            <label className="control-label">✍️ Extra Details (optional)</label>
            <textarea
              className="custom-prompt-input"
              placeholder="e.g. wearing gold jewellery, laughing, backlit sunset..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <button
            className={`influencer-generate-btn ${isGenerating ? "loading" : ""}`}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner" />
                Generating Riya...
              </>
            ) : (
              <>✨ Generate Photo</>
            )}
          </button>
        </div>

        {/* Right Panel: Result */}
        <div className="influencer-result-panel">
          {error && (
            <div className="influencer-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {isGenerating && (
            <div className="influencer-generating">
              <div className="generating-animation">
                <div className="gen-ring gen-ring-1" />
                <div className="gen-ring gen-ring-2" />
                <div className="gen-ring gen-ring-3" />
                <span className="gen-icon">✨</span>
              </div>
              <p className="generating-text">Crafting your perfect shot...</p>
              <p className="generating-subtext">AI is painting Riya just for you</p>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="influencer-empty">
              <div className="empty-illustration">
                <span>🎬</span>
              </div>
              <h3>Your photo will appear here</h3>
              <p>Pick a scene, outfit & mood — then hit Generate!</p>
            </div>
          )}

          {generatedImage && !isGenerating && (
            <div className="influencer-result">
              <div className="result-image-wrapper">
                <img
                  src={generatedImage}
                  alt="Generated Riya influencer photo"
                  className="result-image"
                />
                <div className="result-badge">✨ AI Generated</div>
              </div>
              <div className="result-actions">
                <button
                  className="result-action-btn primary"
                  onClick={() => handleSendToTryon(generatedImage)}
                >
                  👗 Send to Try-On
                </button>
                <button
                  className="result-action-btn secondary"
                  onClick={() => handleDownload(generatedImage)}
                >
                  ⬇️ Download
                </button>
                <button
                  className="result-action-btn outline"
                  onClick={handleGenerate}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="influencer-gallery">
          <div className="influencer-gallery-header">
            <h2 className="influencer-gallery-title">📸 Generated Photos</h2>
            <span className="influencer-gallery-count">{gallery.length} photos</span>
          </div>
          <div className="influencer-gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="influencer-gallery-card">
                <img
                  src={item.image}
                  alt="Influencer photo"
                  className="influencer-gallery-img"
                  onClick={() => setSelectedGalleryImg(item)}
                />
                <div className="influencer-gallery-overlay">
                  <div className="influencer-gallery-tags">
                    <span>{item.theme}</span>
                    <span>{item.outfit}</span>
                  </div>
                  <div className="influencer-gallery-btns">
                    <button
                      onClick={() => handleSendToTryon(item.image)}
                      title="Send to Try-On"
                    >
                      👗
                    </button>
                    <button
                      onClick={() => handleDownload(item.image)}
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedGalleryImg && (
        <div
          className="influencer-lightbox"
          onClick={() => setSelectedGalleryImg(null)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedGalleryImg(null)}
            >
              ✕
            </button>
            <img
              src={selectedGalleryImg.image}
              alt="Full view"
              className="lightbox-img"
            />
            <div className="lightbox-actions">
              <button
                className="result-action-btn primary"
                onClick={() => {
                  handleSendToTryon(selectedGalleryImg.image);
                  setSelectedGalleryImg(null);
                }}
              >
                👗 Send to Try-On
              </button>
              <button
                className="result-action-btn secondary"
                onClick={() => handleDownload(selectedGalleryImg.image)}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
