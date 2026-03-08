"use client";

const POSES = [
    {
        id: "confident-standing",
        emoji: "🧍",
        label: "Confident Standing",
        description: "Natural, straight standing pose with arms relaxed at sides, weight evenly distributed, chin slightly lifted — a classic fashion lookbook pose",
    },
    {
        id: "walking",
        emoji: "🚶",
        label: "Walking",
        description: "Mid-stride walking pose, one foot forward, arms in natural swing, dynamic movement captured mid-step like a runway walk",
    },
    {
        id: "dynamic",
        emoji: "💃",
        label: "Dynamic",
        description: "Energetic fashion editorial pose with dramatic body angle, one hand on hip or in hair, expressive and bold like a high-fashion magazine cover",
    },
    {
        id: "seated",
        emoji: "🪑",
        label: "Seated",
        description: "Seated or perched pose on a stool or ledge, legs crossed elegantly, relaxed but stylish posture, editorial sitting pose",
    },
    {
        id: "over-shoulder",
        emoji: "🤳",
        label: "Over the Shoulder",
        description: "Looking back over the shoulder, body turned partially away from camera, face visible in a three-quarter or profile view, mysterious and alluring",
    },
    {
        id: "casual-lean",
        emoji: "🏖️",
        label: "Casual Lean",
        description: "Casually leaning against a wall or surface with one shoulder, relaxed stance, one leg slightly bent, cool and effortless vibe",
    },
];

export default function PoseSelector({ selectedPose, onSelectPose, onApplyPose, onRandomPose, isProcessing, isGeneratingPrompt, disabled }) {
    return (
        <div className="pose-section">
            <div className="pose-header">
                <h4 className="pose-title">
                    <span className="pose-title-icon">🎭</span>
                    Pose Studio
                </h4>
                <span className="pose-subtitle">Change your model&apos;s pose</span>
            </div>

            <div className="pose-grid">
                {/* AI Random Pose — always first */}
                <button
                    className={`pose-card pose-card-random ${isGeneratingPrompt ? "loading" : ""}`}
                    onClick={onRandomPose}
                    disabled={disabled || isProcessing || isGeneratingPrompt}
                    title="AI generates a unique creative pose & camera angle"
                >
                    <span className="pose-card-emoji">{isGeneratingPrompt ? "⏳" : "🎲"}</span>
                    <span className="pose-card-label">{isGeneratingPrompt ? "Generating..." : "AI Random"}</span>
                </button>

                {POSES.map((pose) => (
                    <button
                        key={pose.id}
                        className={`pose-card ${selectedPose?.id === pose.id ? "selected" : ""}`}
                        onClick={() => onSelectPose(pose)}
                        disabled={disabled || isProcessing}
                        title={pose.description}
                    >
                        <span className="pose-card-emoji">{pose.emoji}</span>
                        <span className="pose-card-label">{pose.label}</span>
                    </button>
                ))}
            </div>

            {selectedPose && (
                <div className="pose-apply-section">
                    <button
                        className="btn btn-primary pose-apply-btn"
                        onClick={() => onApplyPose(selectedPose)}
                        disabled={isProcessing || disabled}
                    >
                        {isProcessing ? "⏳ Applying Pose..." : `✨ Apply "${selectedPose.label}" Pose`}
                    </button>
                </div>
            )}
        </div>
    );
}
