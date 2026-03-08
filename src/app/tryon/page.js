"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import OutfitUploader from "@/components/OutfitUploader";
import Wardrobe from "@/components/Wardrobe";
import PoseSelector from "@/components/PoseSelector";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import ImageQualitySelector from "@/components/ImageQualitySelector";

export default function TryOnPage() {
    const router = useRouter();
    const { apiKey } = useApiKey();
    const [modelImage, setModelImage] = useState(null);
    const [originalModelImage, setOriginalModelImage] = useState(null);
    const [modelWithRecentOutfit, setModelWithRecentOutfit] = useState(null);
    const [outfitImage, setOutfitImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingType, setProcessingType] = useState(null); // 'outfit' or 'pose'
    const [error, setError] = useState(null);
    const [wardrobe, setWardrobe] = useState([]);
    const [selectedWardrobeId, setSelectedWardrobeId] = useState(null);
    const [selectedPose, setSelectedPose] = useState(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("9:16");
    const [imageQuality, setImageQuality] = useState("1K");

    // Load model image from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("vto-confirmed-model");
            if (saved) {
                setModelImage(saved);
                setOriginalModelImage(saved);
            } else {
                router.push("/");
            }
        } catch (e) {
            console.error("Failed to load model:", e);
            router.push("/");
        }
    }, [router]);

    // Load wardrobe from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("vto-wardrobe");
            if (saved) setWardrobe(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load wardrobe:", e);
        }
    }, []);

    const saveWardrobe = (items) => {
        setWardrobe(items);
        try {
            localStorage.setItem("vto-wardrobe", JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save wardrobe:", e);
        }
    };

    const addToWardrobe = (outfitData) => {
        const exists = wardrobe.some(
            (item) => item.name === outfitData.name && item.size === outfitData.size
        );
        if (!exists) {
            const newItem = {
                id: Date.now().toString(),
                base64: outfitData.base64,
                preview: outfitData.preview,
                mimeType: outfitData.mimeType,
                name: outfitData.name,
                size: outfitData.size,
                addedAt: new Date().toISOString(),
            };
            const updated = [newItem, ...wardrobe];
            saveWardrobe(updated);
            setSelectedWardrobeId(newItem.id);
            return newItem.id;
        } else {
            // Find existing and select it
            const existing = wardrobe.find(
                (item) => item.name === outfitData.name && item.size === outfitData.size
            );
            if (existing) setSelectedWardrobeId(existing.id);
            return existing?.id;
        }
    };

    const handleOutfitSelected = useCallback((outfitData) => {
        setOutfitImage(outfitData);
        setError(null);
        addToWardrobe(outfitData);
    }, [wardrobe]);

    const handleWardrobeSelect = (outfitData, itemId) => {
        setOutfitImage(outfitData);
        setSelectedWardrobeId(itemId);
        setError(null);
    };

    const handleWardrobeDelete = (id) => {
        const updated = wardrobe.filter((item) => item.id !== id);
        saveWardrobe(updated);
        if (selectedWardrobeId === id) {
            setSelectedWardrobeId(null);
            setOutfitImage(null);
        }
    };

    const handleApplyOutfit = async () => {
        if (!originalModelImage || !outfitImage) return;

        setIsProcessing(true);
        setProcessingType('outfit');
        setError(null);

        try {
            const modelBase64 = originalModelImage.split(",")[1];
            const modelMime = originalModelImage.split(";")[0].split(":")[1];

            const response = await fetch("/api/tryon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelImageBase64: modelBase64,
                    modelMimeType: modelMime,
                    outfitImageBase64: outfitImage.base64,
                    outfitMimeType: outfitImage.mimeType,
                    aspectRatio,
                    imageQuality,
                    apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to apply outfit");
            }

            const imageUrl = `data:${data.mimeType};base64,${data.image}`;
            setResultImage(imageUrl);
            setModelImage(imageUrl);
            setModelWithRecentOutfit(imageUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
            setProcessingType(null);
        }
    };

    const handleApplyPose = async (pose) => {
        const poseSourceImage = modelWithRecentOutfit || originalModelImage;
        if (!poseSourceImage) return;

        setIsProcessing(true);
        setProcessingType('pose');
        setError(null);

        try {
            const imgBase64 = poseSourceImage.split(",")[1];
            const imgMime = poseSourceImage.split(";")[0].split(":")[1];

            const response = await fetch("/api/pose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelImageBase64: imgBase64,
                    modelMimeType: imgMime,
                    poseName: pose.label,
                    poseDescription: pose.description,
                    aspectRatio,
                    imageQuality,
                    apiKey,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to apply pose");
            }

            const imageUrl = `data:${data.mimeType};base64,${data.image}`;
            setResultImage(imageUrl);
            setModelImage(imageUrl);

            // Increment try-on count
            try {
                const count = parseInt(localStorage.getItem("vto-tryon-count") || "0", 10);
                localStorage.setItem("vto-tryon-count", (count + 1).toString());
            } catch (_) { }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
            setProcessingType(null);
        }
    };

    const handleRandomPose = async () => {
        setError(null);
        setIsGeneratingPrompt(true);
        setSelectedPose(null);

        try {
            const response = await fetch("/api/random-pose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate pose idea");
            }

            setSelectedPose({
                id: "ai-random",
                emoji: "🎲",
                label: data.mood || "AI Random",
                description: `${data.pose}. Camera angle: ${data.angle}`,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleResetModel = () => {
        setModelImage(originalModelImage);
        setResultImage(null);
        setModelWithRecentOutfit(null);
    };

    const handleDownload = () => {
        const img = resultImage || modelImage;
        if (!img) return;
        const link = document.createElement("a");
        link.href = img;
        link.download = `tryon-result-${Date.now()}.png`;
        link.click();
    };

    const handleBackHome = () => {
        router.push("/");
    };

    if (!modelImage) {
        return (
            <div className="tryon-loading-page">
                <div className="loading-container">
                    <div className="spinner-wrapper">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-dot"></div>
                    </div>
                    <p className="loading-text">Loading your virtual model...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tryon-page">
            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="tryon-layout">
                {/* Left: Virtual Model — shows result here after applying */}
                <div className="tryon-model-panel">
                    <div className="tryon-panel-header">
                        <span className={`result-card-dot ${resultImage ? "generated" : "original"}`}></span>
                        <span className="tryon-panel-label">
                            {resultImage ? "Try-On Result" : "Your Virtual Model"}
                        </span>
                        {resultImage && (
                            <div className="tryon-panel-actions">
                                <button
                                    className="panel-action-btn"
                                    onClick={handleDownload}
                                    title="Download"
                                >
                                    ⬇
                                </button>
                                <button
                                    className="panel-action-btn"
                                    onClick={handleResetModel}
                                    title="Reset to original"
                                >
                                    ↩
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="tryon-model-image-wrapper">
                        {isProcessing && (
                            <div className="tryon-model-loading-overlay">
                                <div className="spinner-wrapper">
                                    <div className="spinner-ring"></div>
                                    <div className="spinner-ring"></div>
                                    <div className="spinner-ring"></div>
                                    <div className="spinner-dot"></div>
                                </div>
                                <p className="loading-text">{processingType === 'pose' ? 'Applying pose...' : 'Applying outfit...'}</p>
                            </div>
                        )}
                        <img src={modelImage} alt="Your virtual model" />
                    </div>
                </div>

                {/* Right: Outfit Panel */}
                <div className="tryon-outfit-panel">
                    <div className="tryon-panel-header">
                        <span className="result-card-dot generated"></span>
                        <span className="tryon-panel-label">Outfit Panel</span>
                    </div>

                    {/* Upload zone — always visible */}
                    <OutfitUploader onOutfitSelected={handleOutfitSelected} disabled={isProcessing} />

                    {/* Apply button — visible when outfit is selected */}
                    {outfitImage && (
                        <div className="tryon-apply-section">
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} disabled={isProcessing} />
                            <ImageQualitySelector value={imageQuality} onChange={setImageQuality} disabled={isProcessing} />
                            <button
                                className="btn btn-primary tryon-apply-btn"
                                onClick={handleApplyOutfit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "⏳ Applying..." : "✨ Apply Outfit"}
                            </button>
                        </div>
                    )}

                    {/* Wardrobe Section */}
                    <Wardrobe
                        items={wardrobe}
                        selectedId={selectedWardrobeId}
                        onSelect={handleWardrobeSelect}
                        onDelete={handleWardrobeDelete}
                    />

                    {/* Pose Studio Section */}
                    <PoseSelector
                        selectedPose={selectedPose}
                        onSelectPose={setSelectedPose}
                        onApplyPose={handleApplyPose}
                        onRandomPose={handleRandomPose}
                        isProcessing={isProcessing && processingType === 'pose'}
                        isGeneratingPrompt={isGeneratingPrompt}
                        disabled={isProcessing || isGeneratingPrompt}
                    />
                </div>
            </div>
        </div>
    );
}
