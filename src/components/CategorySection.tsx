import type { ReactNode } from "react";
import { type CategoryMeta, COLOR_MAP } from "../constants/categories";

interface CategorySectionProps {
    category: CategoryMeta;
    count: number;
    children: ReactNode;
}

export default function CategorySection({
    category,
    count,
    children,
}: CategorySectionProps) {
    const colors = COLOR_MAP[category.color] ?? COLOR_MAP.gray;

    return (
        <section className="mb-10 last:mb-0">
            {/* Section header */}
            <div
                className={`flex items-center gap-3 mb-5 pb-3 border-b ${colors.header}`}
            >
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

                <h2 className="text-lg font-semibold text-white">
                    {category.key}
                </h2>

                <span
                    className={`ml-auto inline-flex items-center rounded-full ${colors.bg} px-2.5 py-0.5 text-xs font-semibold ${colors.text} ring-1 ${colors.ring}`}
                >
                    {count}
                </span>
            </div>

            {/* Cards */}
            {children}
        </section>
    );
}
