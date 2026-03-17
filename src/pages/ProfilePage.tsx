import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
    const { userProfile, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        setUploading(true);
        setUploadError("");

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${userProfile.id}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: urlData.publicUrl })
                .eq("id", userProfile.id);

            if (updateError) throw updateError;

            await refreshProfile();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Upload failed.";
            setUploadError(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (!userProfile) return null;

    const initials = userProfile.name
        ? userProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : userProfile.email[0].toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-xl px-4 sm:px-6 py-8">
                {/* Profile Card */}
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/25">
                                {userProfile.avatar_url ? (
                                    <img
                                        src={userProfile.avatar_url}
                                        alt={userProfile.name || "Avatar"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            {/* Upload overlay */}
                            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                                    </svg>
                                )}
                            </label>
                        </div>
                        {uploadError && (
                            <p className="mt-2 text-xs text-red-400">{uploadError}</p>
                        )}
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Hover to change photo</p>
                    </div>

                    {/* Info fields */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.name || "—"}</p>
                        </div>

                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Access Level</p>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${userProfile.role === "admin"
                                        ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30"
                                        : "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                                    }`}>
                                    {userProfile.role === "admin" ? "🛡️ Admin" : "👤 User"}
                                </span>
                            </div>

                            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Department</p>
                                <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300 ring-1 ring-teal-500/30">
                                    {userProfile.department || "General"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-6 border-t border-black/10 dark:border-white/10" />

                    {/* Support */}
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
                                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Support / Help</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Need help? Contact your administrator or email{" "}
                                    <a href="mailto:support@smartnotice.edu" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        support@smartnotice.edu
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </main>
        </div>
    );
}
