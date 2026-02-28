// Shared category definitions used across Dashboard, Admin, and components.
// Each category has a display label, an SVG icon path, and a Tailwind accent color.

export interface CategoryMeta {
    key: string;
    icon: string; // SVG path (24×24 viewBox, strokeWidth 1.5)
    color: string; // Tailwind color name prefix
}

export const CATEGORIES: CategoryMeta[] = [
    {
        key: "General",
        icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5",
        color: "indigo",
    },
    {
        key: "Academic",
        icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5",
        color: "blue",
    },
    {
        key: "Event",
        icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z",
        color: "purple",
    },
    {
        key: "Exam",
        icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
        color: "amber",
    },
    {
        key: "Sports",
        icon: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 13.125 12h-2.25A3.375 3.375 0 0 0 7.5 14.25v4.5m6-6V6.75m0 0a2.25 2.25 0 1 0-4.5 0m4.5 0a2.25 2.25 0 1 1-4.5 0",
        color: "emerald",
    },
    {
        key: "Placement",
        icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 17.25c-2.776 0-5.45-.47-7.927-1.339a2.227 2.227 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 13.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0",
        color: "cyan",
    },
    {
        key: "Other",
        icon: "M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z",
        color: "gray",
    },
];

// Helper: Tailwind color maps for dynamic class generation
// We need explicit class names because Tailwind can't detect dynamically constructed ones.
export const COLOR_MAP: Record<string, { bg: string; text: string; ring: string; header: string; icon: string }> = {
    indigo: {
        bg: "bg-indigo-500/10",
        text: "text-indigo-300",
        ring: "ring-indigo-500/30",
        header: "border-indigo-500/30",
        icon: "text-indigo-400",
    },
    blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-300",
        ring: "ring-blue-500/30",
        header: "border-blue-500/30",
        icon: "text-blue-400",
    },
    purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-300",
        ring: "ring-purple-500/30",
        header: "border-purple-500/30",
        icon: "text-purple-400",
    },
    amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-300",
        ring: "ring-amber-500/30",
        header: "border-amber-500/30",
        icon: "text-amber-400",
    },
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-300",
        ring: "ring-emerald-500/30",
        header: "border-emerald-500/30",
        icon: "text-emerald-400",
    },
    cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-300",
        ring: "ring-cyan-500/30",
        header: "border-cyan-500/30",
        icon: "text-cyan-400",
    },
    gray: {
        bg: "bg-gray-500/10",
        text: "text-gray-300",
        ring: "ring-gray-500/30",
        header: "border-gray-500/30",
        icon: "text-gray-400",
    },
};
