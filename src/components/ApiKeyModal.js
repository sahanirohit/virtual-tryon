"use client";

import { useState } from "react";
import { useApiKey } from "@/context/ApiKeyContext";

export default function ApiKeyModal() {
    const { showModal, saveApiKey, isLoaded } = useApiKey();
    const [inputValue, setInputValue] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    if (!isLoaded || !showModal) return null;

    const handleSave = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            setError("Please enter a valid API key");
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
            return;
        }
        setError("");
        saveApiKey(trimmed);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        }
    };

    return (
        <div className="apikey-modal-overlay">
            <div className="apikey-modal-backdrop" />
            <div className={`apikey-modal-card ${isAnimating ? "shake" : ""}`}>
                {/* Glow accent */}
                <div className="apikey-modal-glow" />

                {/* Icon */}
                <div className="apikey-modal-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                </div>

                {/* Content */}
                <h2 className="apikey-modal-title">Enter Your API Key</h2>
                <p className="apikey-modal-description">
                    Enter your <strong>Google Gemini API Key</strong> to power AI features.
                    Your key is stored locally and never sent to our servers.
                </p>

                {/* Input */}
                <div className="apikey-modal-input-wrapper">
                    <input
                        id="apikey-input"
                        type={showKey ? "text" : "password"}
                        className={`apikey-modal-input ${error ? "apikey-modal-input--error" : ""}`}
                        placeholder="AIzaSy..."
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <button
                        className="apikey-modal-toggle"
                        onClick={() => setShowKey(!showKey)}
                        type="button"
                        aria-label={showKey ? "Hide API key" : "Show API key"}
                    >
                        {showKey ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>
                {error && <p className="apikey-modal-error">{error}</p>}

                {/* Help link */}
                <p className="apikey-modal-help">
                    Don&apos;t have a key?{" "}
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Get one from Google AI Studio →
                    </a>
                </p>

                {/* Save button */}
                <button className="apikey-modal-save" onClick={handleSave}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Save &amp; Continue
                </button>

                {/* Footer */}
                <div className="apikey-modal-footer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Encrypted &amp; stored only in your browser</span>
                </div>
            </div>
        </div>
    );
}
