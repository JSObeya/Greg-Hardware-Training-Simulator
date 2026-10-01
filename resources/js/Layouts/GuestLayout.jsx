import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-hidden p-6">
            {/* Tech background graphics */}
            <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -left-40 w-96 h-96 bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-md z-10">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col items-center gap-2.5 mb-2">
                        <img src="/images/logo.png" alt="Greg & Co. Logo" className="h-16 w-auto rounded bg-white p-1" />
                        <span className="font-extrabold text-slate-100 tracking-wider text-sm sm:text-base mt-2">
                            GREG & CO. <span className="text-blue-500 font-light">SIMULATOR</span>
                        </span>
                    </Link>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Hardware Training Workstation
                    </span>
                </div>

                {/* Form container */}
                <div className="overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur p-8 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
