"use client";

import { useRef, useState, useCallback } from "react";

function UploadZone({ label, icon, description, image, onImageSelected, onRemove, disabled }) {
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const processFile = useCallback(
        (file) => {
            if (!file || !file.type.startsWith("image/")) {
                alert("Please upload a valid image file (JPEG, PNG, or WebP)");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be under 10MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(",")[1];
                onImageSelected({
                    base64,
                    preview: e.target.result,
                    mimeType: file.type,
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                });
            };
            reader.readAsDataURL(file);
        },
        [onImageSelected]
    );

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleClick = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    if (image) {
        return (
            <div className="st-upload-card st-upload-card--has-image">
                <div className="st-card-label">
                    <span className="st-card-label-icon">{icon}</span>
                    <span>{label}</span>
                </div>
                <div className="st-preview-wrapper">
                    <img src={image.preview} alt={label} />
                    <div className="st-preview-overlay">
                        <div className="st-preview-info">
                            {image.name}
                            <span>{image.size}</span>
                        </div>
                        {!disabled && (
                            <button className="st-preview-change-btn" onClick={onRemove}>
                                Change
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="st-upload-card">
            <div className="st-card-label">
                <span className="st-card-label-icon">{icon}</span>
                <span>{label}</span>
            </div>
            <div
                className={`st-drop-zone ${isDragOver ? "dragover" : ""} ${disabled ? "disabled" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="st-drop-icon">{icon}</div>
                <p className="st-drop-title">{description}</p>
                <span className="st-drop-hint">Drag & drop or click to browse</span>
                <span className="st-drop-formats">JPEG, PNG, WebP · Max 10MB</span>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>
    );
}

export default function StyleTransferUploader({
    modelImage,
    referenceImage,
    onModelSelected,
    onReferenceSelected,
    onRemoveModel,
    onRemoveReference,
    disabled,
}) {
    return (
        <div className="st-upload-grid">
            <UploadZone
                label="Model Photo"
                icon="🧑"
                description="Upload the face you want to use"
                image={modelImage}
                onImageSelected={onModelSelected}
                onRemove={onRemoveModel}
                disabled={disabled}
            />
            <UploadZone
                label="Reference Image"
                icon="🎨"
                description="Upload the look to recreate"
                image={referenceImage}
                onImageSelected={onReferenceSelected}
                onRemove={onRemoveReference}
                disabled={disabled}
            />
        </div>
    );
}
