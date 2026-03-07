import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Notice } from "../types";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NoticeDetailPage() {
    const { categoryKey, noticeId } = useParams<{ categoryKey: string; noticeId: string }>();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    const decodedCategory = decodeURIComponent(categoryKey || "");

    useEffect(() => {
        const fetchNotice = async () => {
            if (!noticeId) return;
            const { data } = await supabase
                .from("notices")
                .select("*")
                .eq("id", noticeId)
                .single();
            if (data) setNotice(data as Notice);
            setLoading(false);
        };
        fetchNotice();
    }, [noticeId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                    <LoadingSpinner />
                </main>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Notice not found</h1>
                    <p className="text-gray-400 mb-6">This notice may have been deleted or doesn't exist.</p>
                    <Link
                        to="/dashboard"
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </main>
            </div>
        );
    }

    const createdDate = notice.created_at
        ? new Date(notice.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "—";

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                    <Link to="/dashboard" className="hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <Link
                        to={`/category/${encodeURIComponent(decodedCategory)}`}
                        className="hover:text-white transition-colors"
                    >
                        {decodedCategory}
                    </Link>
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-white font-medium truncate">{notice.title}</span>
                </div>

                {/* Notice Card */}
                <article className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    {/* Priority bar */}
                    <div
                        className={`h-1.5 w-full ${notice.priority === "urgent"
                            ? "bg-gradient-to-r from-red-500 to-rose-400"
                            : "bg-gradient-to-r from-indigo-500 to-purple-400"
                            }`}
                    />

                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight flex-1">
                                {notice.title}
                            </h1>
                            <div className="flex items-center gap-2 shrink-0">
                                {notice.priority === "urgent" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                                        Urgent
                                    </span>
                                )}
                                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                                    {notice.category}
                                </span>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <span>Posted: {createdDate}</span>
                            <span>·</span>
                            <span>Expires: {new Date(notice.expiry_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}</span>
                        </div>

                        {/* Image */}
                        {notice.image_url && (
                            <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
                                <img
                                    src={notice.image_url}
                                    alt={notice.title}
                                    className="w-full max-h-[500px] object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                                {notice.description}
                            </p>
                        </div>
                    </div>
                </article>

                {/* Back link */}
                <div className="mt-6">
                    <Link
                        to={`/category/${encodeURIComponent(decodedCategory)}`}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back to {decodedCategory}
                    </Link>
                </div>
            </main>
        </div>
    );
}
