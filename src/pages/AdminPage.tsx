import { useEffect, useState, type FormEvent } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Notice } from "../types";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = [
    "General",
    "Academic",
    "Event",
    "Exam",
    "Sports",
    "Placement",
    "Other",
];

export default function AdminPage() {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [priority, setPriority] = useState<"normal" | "urgent">("normal");
    const [expiryDate, setExpiryDate] = useState("");

    useEffect(() => {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() } as Notice)
            );
            setNotices(fetched);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, "notices"), {
                title,
                description,
                category,
                priority,
                expiryDate,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            // Reset form
            setTitle("");
            setDescription("");
            setCategory(CATEGORIES[0]);
            setPriority("normal");
            setExpiryDate("");
        } catch (err) {
            console.error("Failed to create notice:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (noticeId: string) => {
        if (!confirm("Delete this notice?")) return;
        try {
            await deleteDoc(doc(db, "notices", noticeId));
        } catch (err) {
            console.error("Failed to delete notice:", err);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20";

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Create form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-5">
                                Create Notice
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={inputClass}
                                        placeholder="Notice title"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={inputClass + " resize-none"}
                                        placeholder="Notice description"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className={inputClass}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c} className="bg-gray-900">
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Priority
                                        </label>
                                        <select
                                            id="priority"
                                            value={priority}
                                            onChange={(e) =>
                                                setPriority(e.target.value as "normal" | "urgent")
                                            }
                                            className={inputClass}
                                        >
                                            <option value="normal" className="bg-gray-900">
                                                Normal
                                            </option>
                                            <option value="urgent" className="bg-gray-900">
                                                Urgent
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Expiry Date
                                    </label>
                                    <input
                                        id="expiryDate"
                                        type="date"
                                        required
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {submitting ? "Publishing…" : "Publish Notice"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Notices list */}
                    <div className="lg:col-span-3">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            All Notices ({notices.length})
                        </h2>

                        {loading ? (
                            <LoadingSpinner />
                        ) : notices.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                                <p className="text-gray-400">No notices created yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notices.map((notice) => {
                                    const isExpired =
                                        new Date(notice.expiryDate) < new Date(new Date().toDateString());

                                    return (
                                        <div
                                            key={notice.id}
                                            className={`group rounded-xl border p-4 transition-all ${isExpired
                                                    ? "border-yellow-500/20 bg-yellow-500/5 opacity-60"
                                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-semibold text-white truncate">
                                                            {notice.title}
                                                        </h3>
                                                        {notice.priority === "urgent" && (
                                                            <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-500/30">
                                                                URGENT
                                                            </span>
                                                        )}
                                                        {isExpired && (
                                                            <span className="shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400 ring-1 ring-yellow-500/30">
                                                                EXPIRED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 line-clamp-2">
                                                        {notice.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                                                        <span>{notice.category}</span>
                                                        <span>·</span>
                                                        <span>Expires: {notice.expiryDate}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(notice.id)}
                                                    className="shrink-0 rounded-lg p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                                    title="Delete notice"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
