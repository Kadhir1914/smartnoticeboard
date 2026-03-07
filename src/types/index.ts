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

export type ReactionType = "like" | "dislike";

export interface NoticeReaction {
    id: string;
    notice_id: string;
    user_id: string;
    reaction: ReactionType;
    created_at: string;
}
