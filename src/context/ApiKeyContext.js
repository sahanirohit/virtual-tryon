"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ApiKeyContext = createContext(null);

const STORAGE_KEY = "vto-gemini-api-key";

export function ApiKeyProvider({ children }) {
    const [apiKey, setApiKeyState] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const savedKey = localStorage.getItem(STORAGE_KEY);
            if (savedKey) {
                setApiKeyState(savedKey);
                setShowModal(false);
            } else {
                setShowModal(true);
            }
        } catch (e) {
            console.error("Failed to read API key from localStorage:", e);
            setShowModal(true);
        }
        setIsLoaded(true);
    }, []);

    const saveApiKey = (key) => {
        try {
            localStorage.setItem(STORAGE_KEY, key);
            setApiKeyState(key);
            setShowModal(false);
        } catch (e) {
            console.error("Failed to save API key:", e);
        }
    };

    const clearApiKey = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setApiKeyState("");
            setShowModal(true);
        } catch (e) {
            console.error("Failed to clear API key:", e);
        }
    };

    const openModal = () => setShowModal(true);

    return (
        <ApiKeyContext.Provider
            value={{ apiKey, saveApiKey, clearApiKey, showModal, openModal, isLoaded }}
        >
            {children}
        </ApiKeyContext.Provider>
    );
}

export function useApiKey() {
    const context = useContext(ApiKeyContext);
    if (!context) {
        throw new Error("useApiKey must be used within an ApiKeyProvider");
    }
    return context;
}
