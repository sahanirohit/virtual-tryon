"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import StyleTransferUploader from "@/components/StyleTransferUploader";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import ImageQualitySelector from "@/components/ImageQualitySelector";

export default function StyleTransferPage() {
    const { apiKey } = useApiKey();
    const [modelImage, setModelImage] = useState(null);
    const [referenceImage, setReferenceImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [aspectRatio, setAspectRatio] = useState("9:16");
    const [imageQuality, setImageQuality] = useState("1K");

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

    const handleModelSelected = useCallback((data) => {
        setModelImage(data);
        setError(null);
        setResultImage(null);
    }, []);

    const handleReferenceSelected = useCallback((data) => {
        setReferenceImage(data);
        setError(null);
        setResultImage(null);
    }, []);

    const handleRemoveModel = () => {
        setModelImage(null);
        setResultImage(null);
    };

    const handleRemoveReference = () => {
        setReferenceImage(null);
        setResultImage(null);
    };

    const handleGenerate = async () => {
        if (!modelImage || !referenceImage) return;

        setIsProcessing(true);
        setError(null);
        setResultImage(null);

        try {
            const response = await fetch("/api/style-transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelImageBase64: modelImage.base64,
                    modelMimeType: modelImage.mimeType,
                    referenceImageBase64: referenceImage.base64,
                    referenceMimeType: referenceImage.mimeType,
                    aspectRatio,
                    imageQuality,
                    apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate style transfer");
            }

            const imageUrl = `data:${data.mimeType};base64,${data.image}`;
            setResultImage(imageUrl);

            // Save to history using functional update to avoid stale closure
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

    const handleClearHistory = () => {
        if (window.confirm("Clear all style transfer history?")) {
            saveHistory([]);
        }
    };

    const canGenerate = modelImage && referenceImage && !isProcessing;

    return (
        <div className="style-transfer-page">
            {/* Workspace Card */}
            <div className="workspace-card">
                <div className="workspace-card-header">
                    <h2 className="workspace-card-title">Style Transfer Studio</h2>
                    <p className="workspace-card-subtitle">
                        Upload a model photo and a reference image — AI will recreate the reference with the model's face
                    </p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}

                {/* Upload Grid */}
                <StyleTransferUploader
                    modelImage={modelImage}
                    referenceImage={referenceImage}
                    onModelSelected={handleModelSelected}
                    onReferenceSelected={handleReferenceSelected}
                    onRemoveModel={handleRemoveModel}
                    onRemoveReference={handleRemoveReference}
                    disabled={isProcessing}
                />

                {/* Generate Button */}
                {modelImage && referenceImage && (
                    <div className="st-generate-section">
                        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} disabled={isProcessing} />
                        <ImageQualitySelector value={imageQuality} onChange={setImageQuality} disabled={isProcessing} />
                        <button
                            className="btn btn-primary st-generate-btn"
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                        >
                            {isProcessing ? "⏳ Generating..." : "✨ Generate Style Transfer"}
                        </button>
                    </div>
                )}

                {/* Loading Overlay */}
                {isProcessing && (
                    <div className="st-loading-section">
                        <div className="spinner-wrapper">
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                            <div className="spinner-dot"></div>
                        </div>
                        <p className="loading-text">Transferring style with AI magic...</p>
                        <p className="loading-subtext">This may take a minute</p>
                    </div>
                )}

                {/* Result Section */}
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
                                    <button
                                        className="st-history-delete"
                                        onClick={() => handleDeleteHistory(item.id)}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
