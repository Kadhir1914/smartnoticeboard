import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { type CategoryMeta, COLOR_MAP } from "../constants/categories";

interface CategorySectionProps {
    category: CategoryMeta;
    count: number;
    children: ReactNode;
    linkable?: boolean;
}

export default function CategorySection({
    category,
    count,
    children,
    linkable = true,
}: CategorySectionProps) {
    const colors = COLOR_MAP[category.color] ?? COLOR_MAP.gray;

    const headerContent = (
        <>
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.bg} ring-1 ${colors.ring}`}
            >
                <svg
                    className={`h-5 w-5 ${colors.icon}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={category.icon}
                    />
                </svg>
            </div>

            <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {category.key}
            </h2>

            <span
                className={`ml-auto inline-flex items-center rounded-full ${colors.bg} px-2.5 py-0.5 text-xs font-semibold ${colors.text} ring-1 ${colors.ring}`}
            >
                {count}
            </span>

            {linkable && count > 0 && (
                <svg className="h-4 w-4 text-gray-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            )}
        </>
    );

    return (
        <section className="mb-10 last:mb-0">
            {/* Section header */}
            {linkable ? (
                <Link
                    to={`/category/${encodeURIComponent(category.key)}`}
                    className={`group flex items-center gap-3 mb-5 pb-3 border-b ${colors.header} hover:border-indigo-500/50 transition-colors`}
                >
                    {headerContent}
                </Link>
            ) : (
                <div
                    className={`flex items-center gap-3 mb-5 pb-3 border-b ${colors.header}`}
                >
                    {headerContent}
                </div>
            )}

            {/* Cards */}
            {children}
        </section>
    );
}
