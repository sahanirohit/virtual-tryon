"use client";

import { useState, useEffect } from "react";
import { useApiKey } from "@/context/ApiKeyContext";

const CATEGORIES = [
  { id: "glamour", label: "💎 Glamour & Fashion", icon: "💎" },
  { id: "lifestyle", label: "🌅 Lifestyle", icon: "🌅" },
  { id: "themed", label: "🎭 Themed Shoots", icon: "🎭" },
  { id: "fitness", label: "💪 Fitness", icon: "💪" },
  { id: "intimate", label: "🕯️ Intimate & Boudoir", icon: "🕯️" },
];

const CONTENT_MAP = {
  glamour: [
    { id: "lingerie", label: "Lingerie", emoji: "🩱" },
    { id: "swimwear", label: "Swimwear", emoji: "👙" },
    { id: "evening_gown", label: "Evening Gown", emoji: "👗" },
    { id: "streetwear", label: "Streetwear", emoji: "🧥" },
    { id: "athleisure", label: "Athleisure", emoji: "🏃‍♀️" },
  ],
  lifestyle: [
    { id: "morning_routine", label: "Morning Routine", emoji: "☀️" },
    { id: "cozy_at_home", label: "Cozy at Home", emoji: "🏠" },
    { id: "pool_day", label: "Pool Day", emoji: "🏊" },
    { id: "road_trip", label: "Road Trip", emoji: "🚗" },
    { id: "brunch", label: "Brunch", emoji: "🥂" },
  ],
  themed: [
    { id: "fantasy_cosplay", label: "Fantasy / Cosplay", emoji: "⚔️" },
    { id: "retro_vintage", label: "Retro / Vintage", emoji: "📻" },
    { id: "femme_fatale", label: "Femme Fatale", emoji: "🖤" },
    { id: "angel", label: "Angel", emoji: "👼" },
    { id: "goddess", label: "Goddess", emoji: "👑" },
  ],
  fitness: [
    { id: "yoga_pose", label: "Yoga Pose", emoji: "🧘" },
    { id: "gym_selfie", label: "Gym Selfie", emoji: "🏋️" },
    { id: "post_workout", label: "Post-Workout", emoji: "💦" },
    { id: "stretching", label: "Stretching", emoji: "🤸" },
    { id: "dance", label: "Dance", emoji: "💃" },
  ],
  intimate: [
    { id: "silk_sheets", label: "Silk Sheets", emoji: "🛏️" },
    { id: "mirror_selfie", label: "Mirror Selfie", emoji: "🪞" },
    { id: "bathrobe", label: "Bathrobe", emoji: "🛁" },
    { id: "candlelit", label: "Candlelit", emoji: "🕯️" },
    { id: "getting_ready", label: "Getting Ready", emoji: "💄" },
  ],
};

const MOODS = [
  { id: "confident", label: "😎 Confident" },
  { id: "playful", label: "😄 Playful" },
  { id: "seductive", label: "🔥 Seductive" },
  { id: "sultry", label: "💋 Sultry" },
  { id: "dreamy", label: "✨ Dreamy" },
  { id: "fierce", label: "⚡ Fierce" },
];

const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16", desc: "Portrait" },
  { value: "1:1", label: "1:1", desc: "Square" },
  { value: "4:5", label: "4:5", desc: "Instagram" },
  { value: "16:9", label: "16:9", desc: "Landscape" },
];

const AI_MODELS = [
  { id: "pro", label: "🍌 Nano Banana Pro", desc: "Higher quality" },
  { id: "flash", label: "⚡ Nano Banana 2", desc: "Faster" },
];

const QUALITY_OPTIONS = [
  { id: "1K", label: "1K" },
  { id: "2K", label: "2K" },
];

export default function ContentCreatorPage() {
  const { apiKey } = useApiKey();
  const [modelImage, setModelImage] = useState(null);
  const [modelPreview, setModelPreview] = useState(null);
  const [category, setCategory] = useState("glamour");
  const [contentType, setContentType] = useState("lingerie");
  const [mood, setMood] = useState("confident");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [aiModel, setAiModel] = useState("pro");
  const [imageQuality, setImageQuality] = useState("1K");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cc-gallery");
      if (saved) setGallery(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Reset content type when category changes
  useEffect(() => {
    const types = CONTENT_MAP[category];
    if (types && types.length > 0) setContentType(types[0].id);
  }, [category]);

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setModelImage(e.target.result);
      setModelPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const saveToGallery = (imageUrl) => {
    const newItem = {
      id: Date.now().toString(),
      image: imageUrl,
      category,
      contentType,
      mood,
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...gallery];
    setGallery(updated);
    try { localStorage.setItem("cc-gallery", JSON.stringify(updated)); } catch (e) {}
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const response = await fetch("/api/content-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelImage, category, contentType, mood, aspectRatio, aiModel, imageQuality, customPrompt, apiKey }),
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
    link.download = `content-creator-${Date.now()}.png`;
    link.click();
  };

  const handleDeleteGallery = (id) => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    try { localStorage.setItem("cc-gallery", JSON.stringify(updated)); } catch (e) {}
  };

  return (
    <div className="cc-page">
      {/* Header */}
      <div className="cc-header">
        <div className="cc-header-text">
          <h1 className="cc-title">
            <span className="cc-title-gradient">Content Creator</span> Studio
          </h1>
          <p className="cc-subtitle">
            Upload a model photo & generate stunning content across 25+ styles 🔥
          </p>
        </div>
        <div className="cc-badge">
          <span className="cc-badge-dot" />
          Ultra Realistic
        </div>
      </div>

      <div className="cc-layout">
        {/* Left Panel: Controls */}
        <div className="cc-controls">
          {/* Model Image Upload */}
          <div className="control-section">
            <label className="control-label">📸 Model Reference Image</label>
            <div
              className={`cc-model-upload ${isDragging ? "dragging" : ""} ${modelPreview ? "has-image" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("cc-model-input").click()}
            >
              {modelPreview ? (
                <div className="cc-model-preview-wrap">
                  <img src={modelPreview} alt="Model reference" className="cc-model-preview-img" />
                  <div className="cc-model-preview-overlay">
                    <span>Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="cc-upload-placeholder">
                  <span className="cc-upload-icon">📤</span>
                  <p className="cc-upload-text">Drag & drop or click to upload</p>
                  <p className="cc-upload-hint">Model face/body reference photo</p>
                </div>
              )}
              <input
                id="cc-model-input"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="control-section">
            <label className="control-label">📂 Content Category</label>
            <div className="cc-category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`cc-category-tab ${category === cat.id ? "active" : ""}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Grid */}
          <div className="control-section">
            <label className="control-label">🎬 Content Type</label>
            <div className="cc-type-grid">
              {(CONTENT_MAP[category] || []).map((ct) => (
                <button
                  key={ct.id}
                  className={`cc-type-card ${contentType === ct.id ? "active" : ""}`}
                  onClick={() => setContentType(ct.id)}
                >
                  <span className="cc-type-emoji">{ct.emoji}</span>
                  <span className="cc-type-label">{ct.label}</span>
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
                  className={`mood-btn ${mood === m.id ? "active" : ""}`}
                  onClick={() => setMood(m.id)}
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

          {/* AI Model Selector */}
          <div className="control-section">
            <label className="control-label">🤖 AI Model</label>
            <div className="cc-model-selector">
              {AI_MODELS.map((m) => (
                <button
                  key={m.id}
                  className={`cc-model-option ${aiModel === m.id ? "active" : ""}`}
                  onClick={() => setAiModel(m.id)}
                >
                  <span className="cc-model-option-label">{m.label}</span>
                  <span className="cc-model-option-desc">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Selector */}
          <div className="control-section">
            <label className="control-label">🎞️ Image Quality</label>
            <div className="cc-quality-row">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.id}
                  className={`cc-quality-btn ${imageQuality === q.id ? "active" : ""}`}
                  onClick={() => setImageQuality(q.id)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="control-section">
            <label className="control-label">✍️ Extra Details (optional)</label>
            <textarea
              className="custom-prompt-input"
              placeholder="e.g. wearing gold jewellery, looking over shoulder, backlit sunset..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <button
            className={`cc-generate-btn ${isGenerating ? "loading" : ""}`}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner" />
                Generating...
              </>
            ) : (
              <>🔥 Generate Content</>
            )}
          </button>
        </div>

        {/* Right Panel: Result */}
        <div className="cc-result-panel">
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
                <span className="gen-icon">🔥</span>
              </div>
              <p className="generating-text">Creating your content...</p>
              <p className="generating-subtext">AI is crafting an ultra-realistic photo</p>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="influencer-empty">
              <div className="empty-illustration">
                <span>🎬</span>
              </div>
              <h3>Your photo will appear here</h3>
              <p>Upload a model, pick a style & mood — then hit Generate!</p>
            </div>
          )}

          {generatedImage && !isGenerating && (
            <div className="influencer-result">
              <div className="result-image-wrapper">
                <img src={generatedImage} alt="Generated content" className="result-image" />
                <div className="result-badge">🔥 Ultra Realistic</div>
              </div>
              <div className="result-actions">
                <button className="result-action-btn secondary" onClick={() => handleDownload(generatedImage)}>
                  ⬇️ Download
                </button>
                <button className="result-action-btn outline" onClick={handleGenerate}>
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
            <h2 className="influencer-gallery-title">🔥 Generated Content</h2>
            <span className="influencer-gallery-count">{gallery.length} photos</span>
          </div>
          <div className="influencer-gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="influencer-gallery-card">
                <img
                  src={item.image}
                  alt="Generated content"
                  className="influencer-gallery-img"
                  onClick={() => setSelectedGalleryImg(item)}
                />
                <div className="influencer-gallery-overlay">
                  <div className="influencer-gallery-tags">
                    <span>{item.category}</span>
                    <span>{item.contentType}</span>
                  </div>
                  <div className="influencer-gallery-btns">
                    <button onClick={() => handleDownload(item.image)} title="Download">⬇️</button>
                    <button onClick={() => handleDeleteGallery(item.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedGalleryImg && (
        <div className="influencer-lightbox" onClick={() => setSelectedGalleryImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedGalleryImg(null)}>✕</button>
            <img src={selectedGalleryImg.image} alt="Full view" className="lightbox-img" />
            <div className="lightbox-actions">
              <button className="result-action-btn secondary" onClick={() => handleDownload(selectedGalleryImg.image)}>
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
