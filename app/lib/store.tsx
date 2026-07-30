"use client";

import React, { createContext, useContext, useState } from "react";

interface AppState {
    isChatbotOpen: boolean;
    setChatbotOpen: (val: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isChatbotOpen, setChatbotOpen] = useState(false);

    return (
        <AppContext.Provider
            value={{
                isChatbotOpen,
                setChatbotOpen,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppStore() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
}
