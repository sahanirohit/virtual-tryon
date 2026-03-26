"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/tryon", label: "Try-On Studio", icon: "👗" },
    { path: "/style-transfer", label: "Style Transfer", icon: "🎨" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleNav = (path) => {
        router.push(path);
    };

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                <span className={`hamburger ${mobileOpen ? "open" : ""}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
                {/* Brand */}
                <div className="sidebar-brand" onClick={() => handleNav("/")}>
                    <div className="sidebar-logo">
                        <span className="sidebar-logo-icon">✦</span>
                    </div>
                    {!collapsed && (
                        <div className="sidebar-brand-text">
                            <span className="sidebar-brand-name">PixelMuse</span>
                            <span className="sidebar-brand-tag">AI Fashion Studio</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">{!collapsed && "MENU"}</div>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            className={`sidebar-nav-item ${pathname === item.path ? "active" : ""}`}
                            onClick={() => handleNav(item.path)}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="sidebar-nav-icon">{item.icon}</span>
                            {!collapsed && <span className="sidebar-nav-text">{item.label}</span>}
                            {pathname === item.path && <span className="sidebar-nav-indicator" />}
                        </button>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="sidebar-footer">
                    <button
                        className="sidebar-nav-item"
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        <span className="sidebar-nav-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
                        {!collapsed && <span className="sidebar-nav-text">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
                    </button>

                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="sidebar-nav-icon">{collapsed ? "»" : "«"}</span>
                        {!collapsed && <span className="sidebar-nav-text">Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
