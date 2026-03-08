"use client";

export default function ModelPreview({
    originalImage,
    generatedImage,
    onConfirm,
    onRegenerate,
    onDownload,
}) {
    return (
        <div className="result-section">
            <div className="result-grid">
                {/* Original Image */}
                <div className="result-card">
                    <div className="result-card-header">
                        <span className="result-card-dot original"></span>
                        <span className="result-card-label">Original Photo</span>
                    </div>
                    <div className="result-image-wrapper">
                        <img
                            src={originalImage.preview}
                            alt="Original uploaded photo"
                        />
                    </div>
                </div>

                {/* Generated Model */}
                <div className="result-card">
                    <div className="result-card-header">
                        <span className="result-card-dot generated"></span>
                        <span className="result-card-label">Generated Virtual Model</span>
                    </div>
                    <div className="result-image-wrapper">
                        <img
                            src={generatedImage}
                            alt="AI-generated virtual model"
                        />
                    </div>
                </div>
            </div>

            <div className="result-actions">
                <h2 className="result-actions-title">Your Virtual Model</h2>
                <p className="result-actions-subtitle">
                    Review the generated model. Confirm to proceed or regenerate for a new variation.
                </p>
                <div className="actions-row">
                    <button className="btn btn-success" onClick={onConfirm}>
                        ✓ Confirm Model
                    </button>
                    <button className="btn btn-secondary" onClick={onRegenerate}>
                        ↻ Regenerate
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={onDownload} title="Download image">
                        ⬇
                    </button>
                </div>
            </div>
        </div>
    );
}
