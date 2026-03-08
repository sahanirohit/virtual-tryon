"use client";

import { useState } from "react";

export default function Gallery({ items, onDelete, onClearAll, onSelectForTryon }) {
    const [lightboxImage, setLightboxImage] = useState(null);

    const handleDownload = (item, e) => {
        e.stopPropagation();
        const link = document.createElement("a");
        link.href = item.image;
        link.download = `virtual-model-${item.id}.png`;
        link.click();
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        onDelete(id);
    };

    const handleTryon = (item, e) => {
        e.stopPropagation();
        if (onSelectForTryon) onSelectForTryon(item);
    };

    if (!items || items.length === 0) {
        return (
            <div className="gallery-section">
                <div className="gallery-header">
                    <h3 className="gallery-title">Generation History</h3>
                </div>
                <div className="gallery-empty">
                    <div className="gallery-empty-icon">🖼️</div>
                    <p>No generated models yet. Upload a photo to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-section">
            <div className="gallery-header">
                <h3 className="gallery-title">Generation History</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="gallery-count">{items.length} images</span>
                    <button className="btn-clear" onClick={onClearAll}>
                        Clear All
                    </button>
                </div>
            </div>
            <div className="gallery-grid">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="gallery-item"
                        onClick={() => setLightboxImage(item.image)}
                    >
                        <img src={item.image} alt={`Generated model ${item.id}`} />
                        <div className="gallery-item-overlay">
                            <span className="gallery-item-date">
                                {new Date(item.timestamp).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div className="gallery-item-actions">
                            <button
                                className="gallery-action-btn tryon-btn"
                                onClick={(e) => handleTryon(item, e)}
                                title="Use for Try-On"
                            >
                                👗
                            </button>
                            <button
                                className="gallery-action-btn"
                                onClick={(e) => handleDownload(item, e)}
                                title="Download"
                            >
                                ⬇
                            </button>
                            <button
                                className="gallery-action-btn delete"
                                onClick={(e) => handleDelete(item.id, e)}
                                title="Delete"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="lightbox-close"
                        onClick={() => setLightboxImage(null)}
                    >
                        ✕
                    </button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={lightboxImage} alt="Full size preview" />
                    </div>
                </div>
            )}
        </div>
    );
}
