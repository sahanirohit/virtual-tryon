"use client";

export default function Wardrobe({ items, selectedId, onSelect, onDelete }) {

    const handleSelect = (item) => {
        onSelect({
            base64: item.base64,
            preview: item.preview,
            mimeType: item.mimeType,
            name: item.name,
            size: item.size,
        }, item.id);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        onDelete(id);
    };

    if (!items || items.length === 0) {
        return (
            <div className="wardrobe-section">
                <div className="wardrobe-header">
                    <h4 className="wardrobe-title">
                        <span className="wardrobe-title-icon">🗄️</span>
                        My Wardrobe
                    </h4>
                    <span className="wardrobe-count">0 items</span>
                </div>
                <div className="wardrobe-empty">
                    <div className="wardrobe-empty-icon">👗</div>
                    <p>Your wardrobe is empty</p>
                    <span>Upload outfits above to build your collection</span>
                </div>
            </div>
        );
    }

    return (
        <div className="wardrobe-section">
            <div className="wardrobe-header">
                <h4 className="wardrobe-title">
                    <span className="wardrobe-title-icon">🗄️</span>
                    My Wardrobe
                </h4>
                <span className="wardrobe-count">{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className="wardrobe-grid">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`wardrobe-item ${selectedId === item.id ? "selected" : ""}`}
                        onClick={() => handleSelect(item)}
                        title={item.name}
                    >
                        <img src={item.preview} alt={item.name} />
                        <div className="wardrobe-item-overlay">
                            <span className="wardrobe-item-name">{item.name}</span>
                        </div>
                        {selectedId === item.id && (
                            <div className="wardrobe-item-selected-badge">✓</div>
                        )}
                        <button
                            className="wardrobe-item-delete"
                            onClick={(e) => handleDelete(item.id, e)}
                            title="Remove from wardrobe"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
