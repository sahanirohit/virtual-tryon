"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const FACE_SLOTS = [
    { id: "front", label: "Front Face", hint: "Looking at camera" },
    { id: "angle", label: "3/4 Angle", hint: "Slightly turned" },
    { id: "side", label: "Side Profile", hint: "Left or right side" },
    { id: "smile", label: "Smiling", hint: "Natural smile" },
    { id: "other", label: "Other Angle", hint: "Any other angle" },
];

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

function FaceSlot({ slot, image, onAdd, onRemove, disabled }) {
    const fileRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = async (file) => {
        try {
            const data = await processFile(file);
            onAdd(slot.id, data);
        } catch (err) {
            alert(err);
        }
    };

    if (image) {
        return (
            <div className="fp-slot fp-slot--filled">
                <img src={image.preview} alt={slot.label} className="fp-slot-img" />
                <div className="fp-slot-overlay">
                    <span className="fp-slot-label">{slot.label}</span>
                    {!disabled && (
                        <button className="fp-slot-remove" onClick={() => onRemove(slot.id)} title="Remove">✕</button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`fp-slot fp-slot--empty ${isDragOver ? "dragover" : ""}`}
            onClick={() => !disabled && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (!disabled) handleFile(e.dataTransfer.files[0]);
            }}
        >
            <div className="fp-slot-placeholder">
                <span className="fp-slot-plus">+</span>
                <span className="fp-slot-label">{slot.label}</span>
                <span className="fp-slot-hint">{slot.hint}</span>
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

function ReferenceUpload({ image, onSelect, onRemove, disabled }) {
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
            <div className="st-ref-card st-ref-card--filled">
                <div className="st-ref-label">
                    <span className="st-ref-icon">🎨</span> Style Reference
                </div>
                <div className="st-ref-preview">
                    <img src={image.preview} alt="Reference" />
                    <div className="st-ref-overlay">
                        <div className="st-ref-info">{image.name}<span>{image.size}</span></div>
                        {!disabled && (
                            <button className="st-ref-change" onClick={onRemove}>Change</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="st-ref-card">
            <div className="st-ref-label">
                <span className="st-ref-icon">🎨</span> Style Reference
            </div>
            <div
                className={`st-ref-drop ${isDragOver ? "dragover" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => !disabled && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (!disabled) handleFile(e.dataTransfer.files[0]);
                }}
            >
                <div className="st-ref-drop-icon">🎨</div>
                <p className="st-ref-drop-title">Upload the look to recreate</p>
                <span className="st-ref-drop-hint">Drag & drop or click to browse</span>
                <span className="st-ref-drop-formats">JPEG, PNG, WebP · Max 10MB</span>
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
    faceImages,
    referenceImage,
    onFaceAdd,
    onFaceRemove,
    onFaceClear,
    onFaceProfileLoad,
    onReferenceSelected,
    onRemoveReference,
    disabled,
}) {
    const [hasProfile, setHasProfile] = useState(false);
    const bulkInputRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("pixelmuse-face-profile");
            if (saved) setHasProfile(true);
        } catch (e) {}
    }, []);

    const faceCount = Object.values(faceImages || {}).filter(Boolean).length;

    const compressImage = (base64, mimeType) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX = 300; // small thumbnail for storage
                let w = img.width, h = img.height;
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL("image/jpeg", 0.7);
                resolve({
                    base64: compressed.split(",")[1],
                    preview: compressed,
                    mimeType: "image/jpeg",
                });
            };
            img.src = `data:${mimeType};base64,${base64}`;
        });
    };

    const handleSaveProfile = async () => {
        if (faceCount === 0) return;
        try {
            // Compress each face image to a small thumbnail for storage
            const compressed = {};
            for (const [slotId, img] of Object.entries(faceImages)) {
                if (img) {
                    const small = await compressImage(img.base64, img.mimeType);
                    compressed[slotId] = { ...img, ...small };
                }
            }
            localStorage.setItem("pixelmuse-face-profile", JSON.stringify(compressed));
            setHasProfile(true);
            alert("✅ Face profile saved!");
        } catch (e) {
            alert("Failed to save face profile — please try with fewer images.");
        }
    };

    const handleLoadProfile = () => {
        try {
            const saved = localStorage.getItem("pixelmuse-face-profile");
            if (saved) {
                const parsed = JSON.parse(saved);
                onFaceProfileLoad(parsed);
            }
        } catch (e) {
            alert("Failed to load face profile.");
        }
    };

    const handleClearProfile = () => {
        if (window.confirm("Delete saved face profile?")) {
            localStorage.removeItem("pixelmuse-face-profile");
            setHasProfile(false);
        }
    };

    const handleBulkUpload = async (e) => {
        const files = Array.from(e.target.files);
        e.target.value = "";
        const emptySlots = FACE_SLOTS.filter((s) => !faceImages[s.id]);
        for (let i = 0; i < Math.min(files.length, emptySlots.length); i++) {
            try {
                const data = await processFile(files[i]);
                onFaceAdd(emptySlots[i].id, data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="st-uploader-v2">
            {/* Face Profile Section */}
            <div className="fp-section">
                <div className="fp-header">
                    <div className="fp-header-text">
                        <h3 className="fp-title">🧑 Face Profile</h3>
                        <p className="fp-subtitle">
                            Upload 3-5 photos of the same person from different angles for best face consistency
                        </p>
                    </div>
                    <div className="fp-header-actions">
                        {hasProfile && faceCount === 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={handleLoadProfile} disabled={disabled}>
                                📂 Load Saved
                            </button>
                        )}
                        {faceCount > 0 && (
                            <>
                                <button className="btn btn-secondary btn-sm" onClick={handleSaveProfile} disabled={disabled}>
                                    💾 Save Profile
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={onFaceClear} disabled={disabled}>
                                    🗑️ Clear
                                </button>
                            </>
                        )}
                        {hasProfile && faceCount > 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={handleClearProfile} disabled={disabled} title="Delete saved profile">
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk upload button */}
                {faceCount < FACE_SLOTS.length && (
                    <div className="fp-bulk">
                        <button
                            className="fp-bulk-btn"
                            onClick={() => bulkInputRef.current?.click()}
                            disabled={disabled}
                        >
                            📤 Upload Multiple Photos
                        </button>
                        <input
                            ref={bulkInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleBulkUpload}
                            style={{ display: "none" }}
                        />
                    </div>
                )}

                {/* Face Slots Grid */}
                <div className="fp-grid">
                    {FACE_SLOTS.map((slot) => (
                        <FaceSlot
                            key={slot.id}
                            slot={slot}
                            image={faceImages[slot.id]}
                            onAdd={onFaceAdd}
                            onRemove={onFaceRemove}
                            disabled={disabled}
                        />
                    ))}
                </div>

                {/* Face count indicator */}
                <div className="fp-count">
                    <span className={`fp-count-num ${faceCount >= 3 ? "good" : faceCount >= 1 ? "ok" : ""}`}>
                        {faceCount}/5 photos
                    </span>
                    <span className="fp-count-hint">
                        {faceCount === 0 ? "Add at least 1 photo" : faceCount < 3 ? "Add more for better consistency" : "✓ Great for consistency"}
                    </span>
                </div>
            </div>

            {/* Reference Image Section */}
            <ReferenceUpload
                image={referenceImage}
                onSelect={onReferenceSelected}
                onRemove={onRemoveReference}
                disabled={disabled}
            />
        </div>
    );
}
