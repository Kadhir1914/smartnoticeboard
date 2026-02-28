import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Notice } from "../types";
import { CATEGORIES } from "../constants/categories";
import Navbar from "../components/Navbar";
import NoticeCard from "../components/NoticeCard";
import CategorySection from "../components/CategorySection";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DashboardPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const fetched: Notice[] = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() } as Notice))
                .filter((notice) => {
                    if (!notice.expiryDate) return true;
                    // Hide expired notices
                    const isExpired = new Date(notice.expiryDate) < new Date(new Date().toDateString());
                    return !isExpired;
                });

            setNotices(fetched);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Group notices by category
    const grouped = new Map<string, Notice[]>();
    for (const notice of notices) {
        const key = notice.category || "Other";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(notice);
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Notice Board</h1>
                    <p className="mt-1 text-gray-400">
                        Stay updated with the latest campus announcements
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
                                            <div className="rounded-xl border border-white/5 bg-white/[0.02] py-8 text-center text-sm text-gray-400">
                                                No notices.
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {catNotices.map((notice) => {
                                                    const isExpired = notice.expiryDate ? new Date(notice.expiryDate) < new Date(new Date().toDateString()) : false;
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
                            }
                            )}
                    </div>
                )}
            </main>
        </div>
    );
}
