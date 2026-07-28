"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TengkulakRecord, INITIAL_TENGKULAK_RECORDS, User, INITIAL_USERS } from "./data";

interface AppState {
    records: TengkulakRecord[];
    users: User[];
    activeUser: User | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    addRecord: (record: Omit<TengkulakRecord, "id" | "timestamp">) => void;
    updateRecord: (id: string, record: Partial<Omit<TengkulakRecord, "id" | "timestamp">>) => void;
    deleteRecord: (id: string) => void;
    isChatbotOpen: boolean;
    setChatbotOpen: (val: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [records, setRecords] = useState<TengkulakRecord[]>([]);
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [activeUser, setActiveUserState] = useState<User | null>(null);
    const [isChatbotOpen, setChatbotOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const stored = localStorage.getItem("taniCerdasData");
        if (stored) {
            setRecords(JSON.parse(stored));
        } else {
            setRecords(INITIAL_TENGKULAK_RECORDS);
        }

        const storedUsers = localStorage.getItem("taniCerdasUsers");
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }

        const storedUser = localStorage.getItem("taniCerdasActiveUser");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Verify user still exists in current user list
            setActiveUserState(parsedUser);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("taniCerdasData", JSON.stringify(records));
            localStorage.setItem("taniCerdasUsers", JSON.stringify(users));
        }
    }, [records, users, isClient]);

    const addRecord = (record: Omit<TengkulakRecord, "id" | "timestamp">) => {
        const newRecord: TengkulakRecord = {
            ...record,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
        };
        setRecords((prev) => [...prev, newRecord]);

        // Automatically create a Tengkulak user account if not exists
        setUsers(prev => {
            const exists = prev.find(u => u.name === record.nama && u.role === "tengkulak");
            if (exists) return prev;
            
            const newUser: User = {
                id: Math.random().toString(36).substring(7),
                name: record.nama,
                username: record.nama.toLowerCase().replace(/\s+/g, ''),
                password: "123", // dummy default password
                role: "tengkulak",
                assignedDusun: record.dusun
            };
            return [...prev, newUser];
        });
    };

    const updateRecord = (id: string, updatedRecord: Partial<Omit<TengkulakRecord, "id" | "timestamp">>) => {
        setRecords((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r))
        );
    };

    const deleteRecord = (id: string) => {
        setRecords((prev) => prev.filter((r) => r.id !== id));
    };

    const login = (username: string, pass: string) => {
        const found = users.find(u => u.username === username && u.password === pass);
        if (found) {
            setActiveUserState(found);
            localStorage.setItem("taniCerdasActiveUser", JSON.stringify(found));
            return true;
        }
        return false;
    };

    const logout = () => {
        setActiveUserState(null);
        localStorage.removeItem("taniCerdasActiveUser");
    };

    return (
        <AppContext.Provider
            value={{
                records,
                users,
                activeUser,
                login,
                logout,
                addRecord,
                updateRecord,
                deleteRecord,
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
