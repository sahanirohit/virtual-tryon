"use client";

export default function TryOnResult({
    modelImage,
    resultImage,
    onTryAnother,
    onDownload,
    onBackHome,
}) {
    return (
        <div className="tryon-result">
            <div className="tryon-result-grid">
                {/* Original Model */}
                <div className="result-card">
                    <div className="result-card-header">
                        <span className="result-card-dot original"></span>
                        <span className="result-card-label">Your Model</span>
                    </div>
                    <div className="result-image-wrapper">
                        <img src={modelImage} alt="Virtual model" />
                    </div>
                </div>

                {/* Try-On Result */}
                <div className="result-card">
                    <div className="result-card-header">
                        <span className="result-card-dot generated"></span>
                        <span className="result-card-label">Try-On Result</span>
                    </div>
                    <div className="result-image-wrapper">
                        <img src={resultImage} alt="Try-on result" />
                    </div>
                </div>
            </div>

            <div className="tryon-result-actions">
                <h2 className="result-actions-title">Outfit Applied!</h2>
                <p className="result-actions-subtitle">
                    Your virtual model is now wearing the selected outfit.
                </p>
                <div className="actions-row">
                    <button className="btn btn-primary" onClick={onTryAnother}>
                        👗 Try Another Outfit
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={onDownload} title="Download">
                        ⬇
                    </button>
                    <button className="btn btn-secondary" onClick={onBackHome}>
                        ← New Model
                    </button>
                </div>
            </div>
        </div>
    );
}
