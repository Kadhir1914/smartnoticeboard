import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Notice, NoticeReaction, ReactionType } from "../types";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NoticeDetailPage() {
    const { categoryKey, noticeId } = useParams<{ categoryKey: string; noticeId: string }>();
    const { user, userProfile } = useAuth();

    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    // Reactions state
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const decodedCategory = decodeURIComponent(categoryKey || "");

    useEffect(() => {
        const fetchData = async () => {
            if (!noticeId) return;

            // Fetch notice
            const { data: noticeData } = await supabase
                .from("notices")
                .select("*")
                .eq("id", noticeId)
                .single();
            if (noticeData) setNotice(noticeData as Notice);

            // Fetch reactions
            const { data: reactionsData } = await supabase
                .from("notice_reactions")
                .select("*")
                .eq("notice_id", noticeId);

            if (reactionsData) {
                const reactions = reactionsData as NoticeReaction[];
                setLikesCount(reactions.filter((r) => r.reaction === "like").length);
                setDislikesCount(reactions.filter((r) => r.reaction === "dislike").length);

                if (user) {
                    const myReaction = reactions.find((r) => r.user_id === user.id);
                    if (myReaction) setUserReaction(myReaction.reaction);
                }
            }

            setLoading(false);
        };
        fetchData();
    }, [noticeId, user]);

    const handleReaction = async (type: ReactionType) => {
        if (!user || userProfile?.role === "admin" || reactionLoading) return;
        setReactionLoading(true);

        try {
            if (userReaction === type) {
                // Remove reaction
                await supabase
                    .from("notice_reactions")
                    .delete()
                    .match({ notice_id: noticeId!, user_id: user.id });

                setUserReaction(null);
                if (type === "like") setLikesCount((p) => Math.max(0, p - 1));
                else setDislikesCount((p) => Math.max(0, p - 1));
            } else {
                // Change or add reaction
                const { data: existing } = await supabase
                    .from("notice_reactions")
                    .select("id")
                    .match({ notice_id: noticeId!, user_id: user.id })
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from("notice_reactions")
                        .update({ reaction: type })
                        .eq("id", existing.id);
                } else {
                    await supabase
                        .from("notice_reactions")
                        .insert({
                            notice_id: noticeId!,
                            user_id: user.id,
                            reaction: type
                        });
                }

                // Update counts
                if (userReaction === "like") setLikesCount((p) => Math.max(0, p - 1));
                else if (userReaction === "dislike") setDislikesCount((p) => Math.max(0, p - 1));

                if (type === "like") setLikesCount((p) => p + 1);
                else setDislikesCount((p) => p + 1);

                setUserReaction(type);
            }
        } catch (error) {
            console.error("Failed to update reaction:", error);
        } finally {
            setReactionLoading(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!notice?.image_url) return;
        setIsDownloading(true);
        try {
            const fileName = notice.image_url.split('/').pop();
            if (!fileName) throw new Error("Could not parse image filename");

            const { data, error } = await supabase.storage.from("notice-images").download(fileName);
            if (error) throw error;

            const url = window.URL.createObjectURL(data);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download image:", error);
            alert("Failed to download image. It may have been removed.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                    <LoadingSpinner />
                </main>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notice not found</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This notice may have been deleted or doesn't exist.</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                    <Link to="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <Link
                        to={`/category/${encodeURIComponent(decodedCategory)}`}
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {decodedCategory}
                    </Link>
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-gray-900 dark:text-white font-medium truncate">{notice.title}</span>
                </div>

                {/* Notice Card */}
                <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
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
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
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
                            <div className="mb-6 group relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                                <img
                                    src={notice.image_url}
                                    alt={notice.title}
                                    className="w-full max-h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button
                                        onClick={handleDownloadImage}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Image
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="prose prose-invert max-w-none mb-8">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                                {notice.description}
                            </p>
                        </div>

                        {/* Reactions Section */}
                        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex items-center gap-4">
                            {userProfile?.role === "admin" ? (
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                        <span className="font-medium text-gray-900 dark:text-white">{likesCount} Likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                        </svg>
                                        <span className="font-medium text-gray-900 dark:text-white">{dislikesCount} Dislikes</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleReaction("like")}
                                        disabled={reactionLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${userReaction === "like"
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <svg className={`w-5 h-5 ${userReaction === "like" ? "fill-emerald-400" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                        Like
                                    </button>
                                    <button
                                        onClick={() => handleReaction("dislike")}
                                        disabled={reactionLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${userReaction === "dislike"
                                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                                            : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <svg className={`w-5 h-5 ${userReaction === "dislike" ? "fill-red-400" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                        </svg>
                                        Dislike
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </article>

                {/* Back link */}
                <div className="mt-6">
                    <Link
                        to={`/category/${encodeURIComponent(decodedCategory)}`}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
