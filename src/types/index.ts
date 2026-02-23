import type { Timestamp } from "firebase/firestore";

export interface Notice {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: "normal" | "urgent";
    createdAt: Timestamp;
    expiryDate: string; // ISO date string (YYYY-MM-DD)
    createdBy: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    role: "admin" | "user";
    createdAt: Timestamp;
}
