"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import StyleTransferUploader from "@/components/StyleTransferUploader";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import ImageQualitySelector from "@/components/ImageQualitySelector";

const AI_MODELS = [
    { id: "pro", label: "🍌 Nano Banana Pro", desc: "Best quality" },
    { id: "flash", label: "⚡ Nano Banana 2", desc: "Faster" },
];

export default function StyleTransferPage() {
    const { apiKey } = useApiKey();
    const [faceImages, setFaceImages] = useState({});
    const [referenceImage, setReferenceImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [aspectRatio, setAspectRatio] = useState("9:16");
    const [imageQuality, setImageQuality] = useState("1K");
    const [aiModel, setAiModel] = useState("pro");

    // Load history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("vto-style-transfer-history");
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load style transfer history:", e);
        }
    }, []);

    const saveHistory = (items) => {
        setHistory(items);
        try {
            localStorage.setItem("vto-style-transfer-history", JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save history:", e);
        }
    };

    const handleFaceAdd = useCallback((slotId, data) => {
        setFaceImages((prev) => ({ ...prev, [slotId]: data }));
        setError(null);
        setResultImage(null);
    }, []);

    const handleFaceRemove = useCallback((slotId) => {
        setFaceImages((prev) => {
            const updated = { ...prev };
            delete updated[slotId];
            return updated;
        });
        setResultImage(null);
    }, []);

    const handleFaceClear = useCallback(() => {
        setFaceImages({});
        setResultImage(null);
    }, []);

    const handleFaceProfileLoad = useCallback((profile) => {
        setFaceImages(profile);
        setError(null);
        setResultImage(null);
    }, []);

    const handleReferenceSelected = useCallback((data) => {
        setReferenceImage(data);
        setError(null);
        setResultImage(null);
    }, []);

    const handleRemoveReference = () => {
        setReferenceImage(null);
        setResultImage(null);
    };

    const faceCount = Object.values(faceImages).filter(Boolean).length;

    const handleGenerate = async () => {
        if (faceCount === 0 || !referenceImage) return;

        setIsProcessing(true);
        setError(null);
        setResultImage(null);

        try {
            // Collect all face images as array
            const faceImagesArray = Object.values(faceImages)
                .filter(Boolean)
                .map((img) => ({
                    base64: img.base64,
                    mimeType: img.mimeType,
                }));

            const response = await fetch("/api/style-transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    faceImages: faceImagesArray,
                    referenceImageBase64: referenceImage.base64,
                    referenceMimeType: referenceImage.mimeType,
                    aspectRatio,
                    imageQuality,
                    aiModel,
                    apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate style transfer");
            }

            const imageUrl = `data:${data.mimeType};base64,${data.image}`;
            setResultImage(imageUrl);

            // Save to history
            const newItem = {
                id: Date.now().toString(),
                result: imageUrl,
                reference: referenceImage.preview,
                timestamp: new Date().toISOString(),
            };
            setHistory((prevHistory) => {
                const updated = [newItem, ...prevHistory].slice(0, 20);
                try {
                    localStorage.setItem("vto-style-transfer-history", JSON.stringify(updated));
                } catch (e) {
                    console.error("Failed to save history:", e);
                }
                return updated;
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement("a");
        link.href = resultImage;
        link.download = `style-transfer-${Date.now()}.png`;
        link.click();
    };

    const handleDeleteHistory = (id) => {
        const updated = history.filter((item) => item.id !== id);
        saveHistory(updated);
    };

    const handleDownloadHistory = (imageUrl) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `style-transfer-${Date.now()}.png`;
        link.click();
    };

    const handleClearHistory = () => {
        if (window.confirm("Clear all style transfer history?")) {
            saveHistory([]);
        }
    };

    const canGenerate = faceCount > 0 && referenceImage && !isProcessing;

    return (
        <div className="style-transfer-page">
            {/* Workspace Card */}
            <div className="workspace-card">
                <div className="workspace-card-header">
                    <h2 className="workspace-card-title">Style Transfer Studio</h2>
                    <p className="workspace-card-subtitle">
                        Build a face profile with 3-5 photos, then upload a style reference — AI will recreate the look with perfect face consistency
                    </p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}

                {/* Uploader */}
                <StyleTransferUploader
                    faceImages={faceImages}
                    referenceImage={referenceImage}
                    onFaceAdd={handleFaceAdd}
                    onFaceRemove={handleFaceRemove}
                    onFaceClear={handleFaceClear}
                    onFaceProfileLoad={handleFaceProfileLoad}
                    onReferenceSelected={handleReferenceSelected}
                    onRemoveReference={handleRemoveReference}
                    disabled={isProcessing}
                />

                {/* Controls & Generate */}
                {faceCount > 0 && referenceImage && (
                    <div className="st-generate-section">
                        {/* Model Selector */}
                        <div className="aspect-ratio-selector">
                            <span className="aspect-ratio-label">AI Model</span>
                            <div className="aspect-ratio-pills">
                                {AI_MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        className={`aspect-ratio-pill ${aiModel === m.id ? "active" : ""}`}
                                        onClick={() => setAiModel(m.id)}
                                        disabled={isProcessing}
                                        type="button"
                                        title={m.desc}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} disabled={isProcessing} />
                        <ImageQualitySelector value={imageQuality} onChange={setImageQuality} disabled={isProcessing} />

                        <button
                            className="btn btn-primary st-generate-btn"
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                        >
                            {isProcessing ? "⏳ Generating..." : `✨ Generate Style Transfer (${faceCount} face ref${faceCount > 1 ? "s" : ""})`}
                        </button>
                    </div>
                )}

                {/* Loading */}
                {isProcessing && (
                    <div className="st-loading-section">
                        <div className="spinner-wrapper">
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                            <div className="spinner-dot"></div>
                        </div>
                        <p className="loading-text">Running 3-step style transfer pipeline...</p>
                        <p className="loading-subtext">Analyze scene → Remove face → Generate with {faceCount} face ref{faceCount > 1 ? "s" : ""}</p>
                    </div>
                )}

                {/* Result */}
                {resultImage && (
                    <div className="st-result-section">
                        <div className="st-result-header">
                            <h3 className="st-result-title">✨ Style Transfer Result</h3>
                        </div>
                        <div className="st-result-comparison">
                            <div className="st-result-card">
                                <div className="st-result-card-label">
                                    <span className="result-card-dot original"></span>
                                    Reference
                                </div>
                                <div className="st-result-image-wrapper">
                                    <img src={referenceImage.preview} alt="Reference" />
                                </div>
                            </div>
                            <div className="st-result-arrow">→</div>
                            <div className="st-result-card st-result-card--primary">
                                <div className="st-result-card-label">
                                    <span className="result-card-dot generated"></span>
                                    Generated
                                </div>
                                <div className="st-result-image-wrapper">
                                    <img src={resultImage} alt="Style Transfer Result" />
                                </div>
                            </div>
                        </div>
                        <div className="st-result-actions">
                            <button className="btn btn-primary" onClick={handleDownload}>
                                ⬇ Download
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleGenerate}
                                disabled={isProcessing}
                            >
                                🔄 Regenerate
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* History Gallery */}
            {history.length > 0 && (
                <div className="workspace-card st-history-card">
                    <div className="workspace-card-header">
                        <div>
                            <h2 className="workspace-card-title">Recent Transfers</h2>
                            <p className="workspace-card-subtitle">
                                Your style transfer history ({history.length})
                            </p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleClearHistory}>
                            🗑️ Clear All
                        </button>
                    </div>
                    <div className="st-history-grid">
                        {history.map((item) => (
                            <div key={item.id} className="st-history-item">
                                <div className="st-history-images">
                                    <div className="st-history-ref">
                                        <img src={item.reference} alt="Reference" />
                                        <span className="st-history-badge">Ref</span>
                                    </div>
                                    <div className="st-history-result">
                                        <img src={item.result} alt="Result" />
                                        <span className="st-history-badge st-history-badge--result">Result</span>
                                    </div>
                                </div>
                                <div className="st-history-meta">
                                    <span className="st-history-date">
                                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    <div className="st-history-actions">
                                        <button
                                            className="st-history-action-btn"
                                            onClick={() => handleDownloadHistory(item.result)}
                                            title="Download"
                                        >
                                            ⬇️
                                        </button>
                                        <button
                                            className="st-history-action-btn st-history-action-btn--delete"
                                            onClick={() => handleDeleteHistory(item.id)}
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
