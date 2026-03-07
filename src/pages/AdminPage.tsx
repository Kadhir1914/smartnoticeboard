import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Notice } from "../types";
import { CATEGORIES, COLOR_MAP } from "../constants/categories";
import Navbar from "../components/Navbar";
import CategorySection from "../components/CategorySection";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminPage() {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0].key);
    const [priority, setPriority] = useState<"normal" | "urgent">("normal");
    const [expiryDate, setExpiryDate] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Fetch notices
    useEffect(() => {
        const fetchNotices = async () => {
            const { data } = await supabase
                .from("notices")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) setNotices(data as Notice[]);
            setLoading(false);
        };
        fetchNotices();

        // Real-time subscription
        const channel = supabase
            .channel("notices-admin")
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
    }, []);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setFormError("");
        try {
            let image_url: string | null = null;

            // Upload image if provided
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("notice-images")
                    .upload(fileName, imageFile, {
                        contentType: imageFile.type,
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from("notice-images")
                    .getPublicUrl(fileName);
                image_url = urlData.publicUrl;
            }

            const { error } = await supabase.from("notices").insert({
                title,
                short_description: shortDescription,
                description,
                category,
                priority,
                expiry_date: expiryDate,
                created_by: user.id,
                image_url,
            });

            if (error) throw error;

            // Reset form
            setTitle("");
            setShortDescription("");
            setDescription("");
            setCategory(CATEGORIES[0].key);
            setPriority("normal");
            setExpiryDate("");
            setImageFile(null);
            setImagePreview(null);
            // Reset file input
            const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setFormError(msg);
            console.error("Failed to create notice:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (noticeId: string) => {
        if (!confirm("Delete this notice?")) return;
        try {
            const { error } = await supabase
                .from("notices")
                .delete()
                .eq("id", noticeId);
            if (error) throw error;
        } catch (err) {
            console.error("Failed to delete notice:", err);
        }
    };

    // Group notices by category
    const grouped = new Map<string, Notice[]>();
    for (const notice of notices) {
        const key = notice.category || "Other";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(notice);
    }

    const inputClass =
        "w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Panel</h1>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Create form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                                Create Notice
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                {formError && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                        {formError}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Short Description
                                    </label>
                                    <input
                                        id="shortDescription"
                                        type="text"
                                        required
                                        maxLength={150}
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        className={inputClass}
                                        placeholder="Brief summary shown on dashboard"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">{shortDescription.length}/150</p>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Long Description
                                    </label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={inputClass + " resize-none"}
                                        placeholder="Full notice details (shown on detail page)"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className={inputClass}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c.key} value={c.key} className="bg-gray-900">
                                                    {c.key}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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

                                {/* Image Upload */}
                                <div>
                                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Image <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-300 file:cursor-pointer hover:file:bg-indigo-500/30 file:transition-colors cursor-pointer"
                                    />
                                    {imagePreview && (
                                        <div className="mt-3 relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-xl border border-black/10 dark:border-white/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                    const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
                                                    if (fileInput) fileInput.value = "";
                                                }}
                                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-gray-900 dark:text-white hover:bg-black/80 transition-colors cursor-pointer"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {submitting ? "Publishing…" : "Publish Notice"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Notices list — grouped by category */}
                    <div className="lg:col-span-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            All Notices ({notices.length})
                        </h2>

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
                                        const colors = COLOR_MAP[cat.color] ?? COLOR_MAP.gray;

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
                                                    <div className="space-y-3">
                                                        {catNotices.map((notice) => {
                                                            const isExpired =
                                                                new Date(notice.expiry_date) < new Date(new Date().toDateString());

                                                            return (
                                                                <div
                                                                    key={notice.id}
                                                                    className={`group rounded-xl border p-4 transition-all ${isExpired
                                                                        ? "border-yellow-500/20 bg-yellow-500/5 opacity-60"
                                                                        : `border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-white/20`
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
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
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                                                {notice.short_description || notice.description}
                                                                            </p>
                                                                            <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                                                                                <span
                                                                                    className={`inline-flex items-center gap-1 rounded-full ${colors.bg} px-2 py-0.5 text-[10px] font-medium ${colors.text} ring-1 ${colors.ring}`}
                                                                                >
                                                                                    {notice.category}
                                                                                </span>
                                                                                <span>·</span>
                                                                                <span>Expires: {notice.expiry_date}</span>
                                                                                {notice.image_url && (
                                                                                    <>
                                                                                        <span>·</span>
                                                                                        <span className="text-indigo-400">📷 Has image</span>
                                                                                    </>
                                                                                )}
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
                                            </CategorySection>
                                        );
                                    }
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
