import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Notice } from "../types";
import Navbar from "../components/Navbar";
import NoticeCard from "../components/NoticeCard";
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
                    // Hide expired notices
                    const expiry = new Date(notice.expiryDate);
                    expiry.setHours(23, 59, 59, 999);
                    return expiry >= now;
                });

            setNotices(fetched);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

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
                ) : notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0H9.75m0 0v3m0-3h3m-6-6h.008v.008H6.75V9.75Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300">No notices yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Check back later for new announcements.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {notices.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
