import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Greg & Co. Hardware Simulator" />
            <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
                {/* Tech background graphics */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-80 -left-40 w-96 h-96 bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Header Navbar */}
                <header className="relative w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo.png" alt="Greg & Co. Logo" className="h-10 w-auto rounded bg-white p-0.5" />
                        <span className="font-extrabold text-slate-100 tracking-wider text-sm sm:text-base">
                            GREG & CO. <span className="text-blue-500 font-light">SIMULATOR</span>
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-lg shadow-blue-500/10"
                            >
                                Enter Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-xs font-semibold text-slate-300 hover:text-white transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition border border-slate-700/50"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 w-full max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl space-y-6">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/30 border border-blue-800/40 px-3 py-1 text-xs font-semibold text-blue-400">
                            ⚡ Standalone Offline Training Workstation
                        </span>
                        
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                            Learn Computer Hardware <br />
                            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                                Before Working on Real Parts
                            </span>
                        </h1>

                        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                            An offline desktop simulation playground for beginners. Master component identification, safety guidelines, motherboard mapping, sequence build-out, fault diagnostic checklists, and generate grading reports.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-bold text-white transition shadow-lg shadow-blue-500/20"
                                >
                                    Resume Simulation Sandbox
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-bold text-white transition shadow-lg shadow-blue-500/20"
                                    >
                                        Access Simulator Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 text-xs font-bold text-slate-300 transition"
                                    >
                                        Create Trainee Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Features Matrix Grid */}
                    <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
                            <span className="text-lg">🔍</span>
                            <h4 className="font-bold text-white mt-2 text-sm uppercase tracking-wider">Component ID</h4>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                Identify processors, memories, cooling units, power sources, and storage modules from actual product references.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
                            <span className="text-lg">📍</span>
                            <h4 className="font-bold text-white mt-2 text-sm uppercase tracking-wider">Motherboard Mapping</h4>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                Coordinate-based interactive hotspot placement for CPU sockets, DIMM sockets, PCI slots, headers, and CMOS units.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
                            <span className="text-lg">🔧</span>
                            <h4 className="font-bold text-white mt-2 text-sm uppercase tracking-wider">Assembly Sequence</h4>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                Sort correct build flows from applying thermal paste to motherboard mounting while enforcing safety milestones.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
                            <span className="text-lg">🛠️</span>
                            <h4 className="font-bold text-white mt-2 text-sm uppercase tracking-wider">Fault Diagnosis</h4>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                Sandbox troubleshooting checklist flow (testing socket, cord, internal connectors) and completing trainee repair reports.
                            </p>
                        </div>
                    </div>

                    {/* Modules Checklist */}
                    <div className="mt-16 w-full max-w-4xl text-center">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-3 mb-6">
                            13 Core Simulator Modules
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400 text-left">
                            {[
                                "1. Intro to Computer Hardware",
                                "2. Safety and ESD Precautions",
                                "3. Components Identification",
                                "4. Motherboard Parts",
                                "5. Storage Devices",
                                "6. Power Supply Unit",
                                "7. RAM and CPU Installation",
                                "8. Desktop Assembly Flow",
                                "9. BIOS/UEFI Basics",
                                "10. Preventive Maintenance",
                                "11. Hardware Troubleshooting",
                                "12. Fault Diagnosis & Report",
                                "13. Final Capstone Project"
                            ].map((mod, index) => (
                                <div key={index} className="flex items-center gap-2 py-1 px-2 hover:text-white transition">
                                    <span className="text-blue-500 font-bold">✔</span>
                                    <span>{mod}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative w-full py-8 text-center text-xs text-slate-600 border-t border-slate-900/50 mt-12 z-10">
                    &copy; {new Date().getFullYear()} Greg & Co. Computer Hardware Training. Running locally in offline database mode.
                </footer>
            </div>
        </>
    );
}
