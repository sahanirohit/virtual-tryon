"use client";

export default function AspectRatioSelector({ value, onChange, disabled }) {
    const options = [
        { ratio: "9:16", label: "9:16" },
        { ratio: "3:4", label: "3:4" },
        { ratio: "4:5", label: "4:5" },
        { ratio: "16:9", label: "16:9" },
    ];

    return (
        <div className="aspect-ratio-selector">
            <span className="aspect-ratio-label">Aspect Ratio</span>
            <div className="aspect-ratio-pills">
                {options.map((opt) => (
                    <button
                        key={opt.ratio}
                        className={`aspect-ratio-pill ${value === opt.ratio ? "active" : ""}`}
                        onClick={() => onChange(opt.ratio)}
                        disabled={disabled}
                        type="button"
                    >
                        <span className="aspect-ratio-pill-icon">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                {opt.ratio === "9:16" ? (
                                    <rect x="3" y="1" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                ) : opt.ratio === "16:9" ? (
                                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                ) : opt.ratio === "3:4" ? (
                                    <rect x="2.5" y="1.5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                ) : (
                                    <rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                )}
                            </svg>
                        </span>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
