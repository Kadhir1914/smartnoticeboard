export interface Notice {
    id: string;
    title: string;
    short_description: string;
    description: string; // long description
    category: string;
    priority: "normal" | "urgent";
    image_url?: string;
    expiry_date: string; // ISO date string (YYYY-MM-DD)
    created_by: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    email: string;
    role: "admin" | "user";
    created_at: string;
}
