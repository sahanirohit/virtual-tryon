"use client";

export default function LoadingSpinner() {
    return (
        <div className="loading-container">
            <div className="spinner-wrapper">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-dot"></div>
            </div>
            <p className="loading-text">Generating your virtual model...</p>
            <p className="loading-subtext">This may take 15–30 seconds</p>
        </div>
    );
}
