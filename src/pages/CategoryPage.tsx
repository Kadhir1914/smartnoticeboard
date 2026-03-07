import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Notice } from "../types";
import { CATEGORIES, COLOR_MAP } from "../constants/categories";
import Navbar from "../components/Navbar";
import NoticeCard from "../components/NoticeCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CategoryPage() {
    const { categoryKey } = useParams<{ categoryKey: string }>();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    const decodedKey = decodeURIComponent(categoryKey || "");
    const categoryMeta = CATEGORIES.find((c) => c.key === decodedKey);
    const colors = COLOR_MAP[categoryMeta?.color || "gray"] ?? COLOR_MAP.gray;

    useEffect(() => {
        const fetchNotices = async () => {
            const today = new Date().toISOString().split("T")[0];
            const { data } = await supabase
                .from("notices")
                .select("*")
                .eq("category", decodedKey)
                .gte("expiry_date", today)
                .order("created_at", { ascending: false });
            if (data) setNotices(data as Notice[]);
            setLoading(false);
        };
        fetchNotices();
    }, [decodedKey]);

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/dashboard" className="hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-white font-medium">{decodedKey}</span>
                </div>

                {/* Category Header */}
                <div className={`flex items-center gap-4 mb-8 pb-4 border-b ${colors.header}`}>
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} ring-1 ${colors.ring}`}
                    >
                        <svg
                            className={`h-6 w-6 ${colors.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={categoryMeta?.icon || ""}
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{decodedKey}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {notices.length} {notices.length === 1 ? "notice" : "notices"}
                        </p>
                    </div>
                </div>

                {/* Notices */}
                {loading ? (
                    <LoadingSpinner />
                ) : notices.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <p className="text-gray-400">No notices in this category.</p>
                        <Link
                            to="/dashboard"
                            className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {notices.map((notice) => (
                            <NoticeCard
                                key={notice.id}
                                notice={notice}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
