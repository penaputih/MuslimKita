export function BackgroundDecoration() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Gradient Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

            {/* Subtle Islamic Pattern Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-slate-900 dark:text-slate-100" />
                        <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-slate-900 dark:text-slate-100" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
            </svg>
        </div>
    );
}
