import type { Notice } from "../types";

interface NoticeCardProps {
    notice: Notice;
    isExpired?: boolean;
}

export default function NoticeCard({ notice, isExpired = false }: NoticeCardProps) {
    const createdDate = notice.createdAt?.toDate
        ? notice.createdAt.toDate().toLocaleDateString()
        : "—";

    return (
        <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${isExpired
            ? "border-yellow-500/20 bg-yellow-500/5 opacity-60"
            : "border-white/10 bg-white/5 backdrop-blur-lg hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
            }`}>
            {/* Priority indicator bar */}
            {!isExpired && (
                <div
                    className={`absolute top-0 left-0 h-1 w-full ${notice.priority === "urgent"
                        ? "bg-gradient-to-r from-red-500 to-rose-400"
                        : "bg-gradient-to-r from-indigo-500 to-purple-400"
                        }`}
                />
            )}

            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-white leading-tight">
                    {notice.title}
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                    {notice.priority === "urgent" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                            {!isExpired && <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />}
                            Urgent
                        </span>
                    )}
                    {isExpired && (
                        <span className="shrink-0 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-yellow-400 ring-1 ring-yellow-500/30">
                            EXPIRED
                        </span>
                    )}
                    <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                        {notice.category}
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
                {notice.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Posted: {createdDate}</span>
                <span>Expires: {notice.expiryDate}</span>
            </div>
        </div>
    );
}
