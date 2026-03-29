"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import ImageUploader from "@/components/ImageUploader";
import ModelPreview from "@/components/ModelPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import Gallery from "@/components/Gallery";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import ImageQualitySelector from "@/components/ImageQualitySelector";

const STEPS = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Generate" },
  { number: 3, label: "Preview" },
];

export default function Home() {
  const router = useRouter();
  const { apiKey } = useApiKey();
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [stats, setStats] = useState({ models: 0, tryons: 0, wardrobe: 0 });
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [imageQuality, setImageQuality] = useState("1K");

  // Load gallery + stats from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vto-gallery");
      if (saved) {
        const parsed = JSON.parse(saved);
        setGallery(parsed);
      }
      // Compute stats
      const galleryItems = JSON.parse(localStorage.getItem("vto-gallery") || "[]");
      const tryonItems = JSON.parse(localStorage.getItem("vto-tryon-history") || "[]");
      const wardrobeItems = JSON.parse(localStorage.getItem("vto-wardrobe") || "[]");
      setStats({
        models: galleryItems.length,
        tryons: tryonItems.length,
        wardrobe: wardrobeItems.length,
      });
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  }, []);

  // Save gallery to localStorage
  const saveGallery = (items) => {
    setGallery(items);
    try {
      localStorage.setItem("vto-gallery", JSON.stringify(items));
      setStats((prev) => ({ ...prev, models: items.length }));
    } catch (e) {
      console.error("Failed to save gallery:", e);
    }
  };

  const handleImageSelected = useCallback((imageData) => {
    setUploadedImage(imageData);
    setGeneratedImage(null);
    setError(null);
    setStep(1);
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setStep(2);
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: uploadedImage.base64,
          mimeType: uploadedImage.mimeType,
          aspectRatio,
          imageQuality,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate model");
      }

      const imageUrl = `data:${data.mimeType};base64,${data.image}`;
      setGeneratedImage(imageUrl);
      setStep(3);
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (!generatedImage) return;

    // Save to gallery
    const newItem = {
      id: Date.now().toString(),
      image: generatedImage,
      timestamp: new Date().toISOString(),
    };
    const updatedGallery = [newItem, ...gallery];
    saveGallery(updatedGallery);

    // Save confirmed model for try-on page
    localStorage.setItem("vto-confirmed-model", generatedImage);

    // Navigate to try-on page
    router.push("/tryon");
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `virtual-model-${Date.now()}.png`;
    link.click();
  };

  const handleDeleteGalleryItem = (id) => {
    const updated = gallery.filter((item) => item.id !== id);
    saveGallery(updated);
  };

  const handleClearGallery = () => {
    if (window.confirm("Are you sure you want to clear all generated images?")) {
      saveGallery([]);
    }
  };

  const handleSelectForTryon = (item) => {
    localStorage.setItem("vto-confirmed-model", item.image);
    router.push("/tryon");
  };

  const handleChangeImage = () => {
    setUploadedImage(null);
    setGeneratedImage(null);
    setStep(1);
    setError(null);
  };

  const handleUseAsIs = () => {
    if (!uploadedImage) return;

    // IMPORTANT: Set confirmed model FIRST — this is critical for tryon page navigation.
    // If gallery save fails (e.g. localStorage quota), navigation should still work.
    try {
      localStorage.setItem("vto-confirmed-model", uploadedImage.preview);
    } catch (e) {
      console.error("Failed to save confirmed model:", e);
      setError("Failed to save image. Please clear some history and try again.");
      return;
    }

    // Save to gallery history (non-critical — OK if this fails)
    try {
      const newItem = {
        id: Date.now().toString(),
        image: uploadedImage.preview,
        timestamp: new Date().toISOString(),
      };
      const updatedGallery = [newItem, ...gallery];
      saveGallery(updatedGallery);
    } catch (e) {
      console.error("Failed to save to gallery:", e);
    }

    router.push("/tryon");
  };

  const getStepState = (stepNumber) => {
    if (stepNumber < step) return "completed";
    if (stepNumber === step) return "active";
    return "";
  };

  return (
    <div className="dashboard-page">
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-icon stat-icon-models">📸</div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.models}</span>
            <span className="stat-card-label">Models Generated</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon stat-icon-tryons">👗</div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.tryons}</span>
            <span className="stat-card-label">Try-Ons Done</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon stat-icon-wardrobe">🗄️</div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.wardrobe}</span>
            <span className="stat-card-label">Wardrobe Items</span>
          </div>
        </div>
      </div>

      {/* Main workspace card */}
      <div className="workspace-card">
        <div className="workspace-card-header">
          <h2 className="workspace-card-title">Model Generator</h2>
          <p className="workspace-card-subtitle">Upload your photo to create a virtual fashion model</p>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.number} style={{ display: "flex", alignItems: "center" }}>
              <div className={`step-item ${getStepState(s.number)}`}>
                <div className="step-number">
                  {getStepState(s.number) === "completed" ? "✓" : s.number}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`step-connector ${step > s.number ? "active" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div className="error-message">⚠️ {error}</div>}

        {/* Step 1: Upload */}
        {step === 1 && !uploadedImage && (
          <ImageUploader onImageSelected={handleImageSelected} />
        )}

        {/* Step 1: Preview uploaded + Generate button */}
        {step === 1 && uploadedImage && !isGenerating && (
          <div className="upload-section">
            <div className="upload-preview-container">
              <div className="upload-preview-wrapper">
                <img src={uploadedImage.preview} alt="Uploaded photo" />
                <div className="preview-overlay">
                  <div className="preview-info">
                    {uploadedImage.name}
                    <span>{uploadedImage.size}</span>
                  </div>
                  <button
                    className="preview-change-btn"
                    onClick={handleChangeImage}
                  >
                    Change
                  </button>
                </div>
              </div>
              <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
              <ImageQualitySelector value={imageQuality} onChange={setImageQuality} />
              <div className="actions-row actions-row-choice">
                <button className="btn btn-primary" onClick={handleGenerate}>
                  ✨ Generate Virtual Model
                </button>
                <span className="actions-or">or</span>
                <button className="btn btn-secondary" onClick={handleUseAsIs}>
                  📷 Use This Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 2 && isGenerating && <LoadingSpinner />}

        {/* Step 3: Result */}
        {step === 3 && generatedImage && uploadedImage && (
          <ModelPreview
            originalImage={uploadedImage}
            generatedImage={generatedImage}
            onConfirm={handleConfirm}
            onRegenerate={handleRegenerate}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Gallery */}
      <Gallery
        items={gallery}
        onDelete={handleDeleteGalleryItem}
        onClearAll={handleClearGallery}
        onSelectForTryon={handleSelectForTryon}
      />
    </div>
  );
}
