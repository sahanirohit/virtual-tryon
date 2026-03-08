"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES = {
    "/": "Dashboard",
    "/tryon": "Try-On Studio",
    "/style-transfer": "Style Transfer",
};

export default function Header() {
    const pathname = usePathname();
    const title = PAGE_TITLES[pathname] || "Dashboard";

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <div className="topbar-left">
                    <h1 className="topbar-title">{title}</h1>
                </div>
                <div className="topbar-right">
                    <div className="topbar-search">
                        <span className="topbar-search-icon">🔍</span>
                        <input
                            type="text"
                            className="topbar-search-input"
                            placeholder="Search..."
                            readOnly
                        />
                    </div>
                    <div className="topbar-avatar">
                        <span className="topbar-avatar-icon">👤</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
