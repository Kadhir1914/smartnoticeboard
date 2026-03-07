import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type SelectedRole = "user" | "admin" | null;

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Login failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedRole(null);
        setError("");
        setEmail("");
        setPassword("");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                        <svg className="h-7 w-7 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedRole ? `${selectedRole === "admin" ? "Admin" : "User"} Login` : "Welcome back"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {selectedRole ? "Sign in to SmartNotice" : "Choose how you'd like to sign in"}
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div
                    className={`transition-all duration-500 ease-in-out ${selectedRole !== null
                        ? "pointer-events-none absolute inset-x-0 -translate-y-4 scale-95 opacity-0"
                        : "translate-y-0 scale-100 opacity-100"
                        }`}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* User Card */}
                        <button
                            onClick={() => setSelectedRole("user")}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-6 text-left transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30">
                                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">User</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                View notices, announcements & campus updates
                            </p>
                        </button>

                        {/* Admin Card */}
                        <button
                            onClick={() => setSelectedRole("admin")}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-6 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-400 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/30">
                                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Admin</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Manage & publish notices, upload images
                            </p>
                        </button>
                    </div>
                </div>

                {/* Login Form */}
                <div
                    className={`transition-all duration-500 ease-in-out ${selectedRole === null
                        ? "pointer-events-none absolute inset-x-0 translate-y-4 scale-95 opacity-0"
                        : "translate-y-0 scale-100 opacity-100"
                        }`}
                >
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-8">
                        {/* Back button */}
                        <button
                            onClick={handleBack}
                            className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="you@university.edu"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${selectedRole === "admin"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                                    : "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/25 hover:shadow-indigo-500/40"
                                    }`}
                            >
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{" "}
                            <Link to="/register" state={{ role: selectedRole }} className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
