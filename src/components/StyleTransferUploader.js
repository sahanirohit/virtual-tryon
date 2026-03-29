"use client";

import { useRef, useState } from "react";

function processFile(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject("Please upload a valid image file (JPEG, PNG, or WebP)");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            reject("File size must be under 10MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve({
                base64: e.target.result.split(",")[1],
                preview: e.target.result,
                mimeType: file.type,
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            });
        };
        reader.onerror = () => reject("Failed to read file");
        reader.readAsDataURL(file);
    });
}

function ImagePanel({ label, icon, hint, image, onSelect, onRemove, disabled, formats }) {
    const fileRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = async (file) => {
        try {
            const data = await processFile(file);
            onSelect(data);
        } catch (err) {
            alert(err);
        }
    };

    if (image) {
        return (
            <div className="st-panel st-panel--filled">
                <div className="st-panel-label">
                    <span className="st-panel-icon">{icon}</span> {label}
                </div>
                <div className="st-panel-preview">
                    <img src={image.preview} alt={label} />
                    <div className="st-panel-overlay">
                        <div className="st-panel-info">
                            {image.name}
                            <span>{image.size}</span>
                        </div>
                        {!disabled && (
                            <button className="st-panel-change" onClick={onRemove}>Change</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="st-panel">
            <div className="st-panel-label">
                <span className="st-panel-icon">{icon}</span> {label}
            </div>
            <div
                className={`st-panel-drop ${isDragOver ? "dragover" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => !disabled && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (!disabled) handleFile(e.dataTransfer.files[0]);
                }}
            >
                <div className="st-panel-drop-icon">{icon}</div>
                <p className="st-panel-drop-title">{hint}</p>
                <span className="st-panel-drop-hint">Drag & drop or click to browse</span>
                <span className="st-panel-drop-formats">{formats || "JPEG, PNG, WebP · Max 10MB"}</span>
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ""; }}
                style={{ display: "none" }}
            />
        </div>
    );
}

export default function StyleTransferUploader({
    modelImage,
    referenceImage,
    onModelSelected,
    onRemoveModel,
    onReferenceSelected,
    onRemoveReference,
    disabled,
}) {
    return (
        <div className="st-uploader-v2">
            <div className="st-panels-row">
                {/* Model Image Panel */}
                <ImagePanel
                    label="Model Image"
                    icon="🧑"
                    hint="Upload the person's photo"
                    image={modelImage}
                    onSelect={onModelSelected}
                    onRemove={onRemoveModel}
                    disabled={disabled}
                />

                {/* Arrow between panels */}
                <div className="st-panels-arrow">+</div>

                {/* Reference Image Panel */}
                <ImagePanel
                    label="Style Reference"
                    icon="🎨"
                    hint="Upload the look to recreate"
                    image={referenceImage}
                    onSelect={onReferenceSelected}
                    onRemove={onRemoveReference}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
