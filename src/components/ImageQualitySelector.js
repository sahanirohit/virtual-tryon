"use client";

export default function ImageQualitySelector({ value, onChange, disabled }) {
    const options = [
        { quality: "1K", label: "1K" },
        { quality: "2K", label: "2K" },
    ];

    return (
        <div className="aspect-ratio-selector">
            <span className="aspect-ratio-label">Quality</span>
            <div className="aspect-ratio-pills">
                {options.map((opt) => (
                    <button
                        key={opt.quality}
                        className={`aspect-ratio-pill ${value === opt.quality ? "active" : ""}`}
                        onClick={() => onChange(opt.quality)}
                        disabled={disabled}
                        type="button"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
