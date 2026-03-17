import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Notice } from "../types";
import { CATEGORIES } from "../constants/categories";
import Navbar from "../components/Navbar";
import NoticeCard from "../components/NoticeCard";
import CategorySection from "../components/CategorySection";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DashboardPage() {
    const { userProfile } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const today = new Date().toISOString().split("T")[0];

            // Fetch notices that match user's department OR are "General"
            const userDept = userProfile?.department || "General";
            const { data } = await supabase
                .from("notices")
                .select("*")
                .gte("expiry_date", today)
                .or(`department.eq.General,department.eq.${userDept}`)
                .order("created_at", { ascending: false });
            if (data) setNotices(data as Notice[]);
            setLoading(false);
        };
        fetchNotices();

        // Real-time subscription
        const channel = supabase
            .channel("notices-dashboard")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "notices" },
                () => {
                    fetchNotices();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userProfile?.department]);

    // Group notices by category
    const grouped = new Map<string, Notice[]>();
    for (const notice of notices) {
        const key = notice.category || "Other";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(notice);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notice Board</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Stay updated with the latest campus announcements
                        {userProfile?.department && userProfile.department !== "General" && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300 ring-1 ring-teal-500/30">
                                {userProfile.department}
                            </span>
                        )}
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="space-y-8">
                        {[...CATEGORIES]
                            .sort((a, b) => {
                                const aHas = (grouped.get(a.key)?.length || 0) > 0 ? 1 : 0;
                                const bHas = (grouped.get(b.key)?.length || 0) > 0 ? 1 : 0;
                                return bHas - aHas;
                            })
                            .map((cat) => {
                                const catNotices = grouped.get(cat.key) || [];
                                return (
                                    <CategorySection
                                        key={cat.key}
                                        category={cat}
                                        count={catNotices.length}
                                    >
                                        {catNotices.length === 0 ? (
                                            <div className="rounded-xl border border-black/5 dark:border-white/5 bg-white/[0.02] py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No notices.
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {catNotices.map((notice) => {
                                                    const isExpired = notice.expiry_date ? new Date(notice.expiry_date) < new Date(new Date().toDateString()) : false;
                                                    return (
                                                        <NoticeCard
                                                            key={notice.id}
                                                            notice={notice}
                                                            isExpired={isExpired}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CategorySection>
                                );
                            })}
                    </div>
                )}
            </main>
        </div>
    );
}
