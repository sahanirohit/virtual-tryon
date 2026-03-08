"use client";

import { useRef, useState, useCallback } from "react";

export default function ImageUploader({ onImageSelected }) {
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
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    return (
        <div className="upload-section">
            <div
                className={`upload-zone ${isDragOver ? "dragover" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="upload-icon">📸</div>
                <h3 className="upload-title">Upload Your Photo</h3>
                <p className="upload-subtitle">
                    Drag & drop your image here or click to browse
                </p>
                <span className="upload-badge">📐 9:16 Portrait Recommended</span>
                <p className="upload-formats">
                    Supports JPEG, PNG, WebP · Max 10MB
                </p>
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
