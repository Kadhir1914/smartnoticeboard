import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Notice } from "../types";

export default function NotificationToast() {
    const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const channel = supabase
            .channel("public-notices-insert")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notices" },
                (payload) => {
                    setLatestNotice(payload.new as Notice);
                    setVisible(true);

                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        setVisible(false);
                    }, 5000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!visible || !latestNotice) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 translate-y-0 opacity-100 transition-all duration-300">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New Notice Published!</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">{latestNotice.title}</p>
                        <div className="mt-3 flex space-x-7">
                            <Link
                                to={`/category/${encodeURIComponent(latestNotice.category)}/notice/${latestNotice.id}`}
                                onClick={() => setVisible(false)}
                                className="rounded-md bg-transparent text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none"
                            >
                                View Notice
                            </Link>
                            <button
                                onClick={() => setVisible(false)}
                                className="rounded-md bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
