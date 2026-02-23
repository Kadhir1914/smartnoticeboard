import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
    const { userProfile, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const linkClass = (path: string) =>
        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(path)
            ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Brand */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-shadow group-hover:shadow-indigo-500/40">
                            <svg
                                className="h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5"
                                />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
                            SmartNotice
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className={linkClass("/dashboard")}>
                            Dashboard
                        </Link>
                        {userProfile?.role === "admin" && (
                            <Link to="/admin" className={linkClass("/admin")}>
                                Admin
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
