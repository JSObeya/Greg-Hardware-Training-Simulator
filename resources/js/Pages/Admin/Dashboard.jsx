import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ stats = { trainees: 0, instructors: 0, labs: 0, submissions: 0 } }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Admin Control Center
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            System telemetry, backup management, user access control, and simulator operations.
                        </p>
                    </div>
                    <span className="rounded-xl border border-sky-800 bg-sky-950/60 px-3 py-1 text-xs font-bold text-sky-300">
                        🛡️ System Administrator
                    </span>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* Welcome Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
                        <div className="p-8 text-white">
                            <h3 className="text-2xl font-black">Welcome back, Administrator</h3>
                            <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
                                Manage training cohorts, generate instant database snapshots, review audit logs, and oversee the interactive simulator syllabus.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Total Active Trainees
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">
                                    {stats.trainees}
                                </div>
                                <span className="text-sky-400 font-bold text-xs font-mono">Enrolled</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Instructors Registered
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">
                                    {stats.instructors}
                                </div>
                                <span className="text-emerald-400 font-bold text-xs font-mono">Active</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Lab Simulators
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">
                                    {stats.labs}
                                </div>
                                <span className="text-blue-400 font-bold text-xs font-mono">Available</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Trainee Submissions
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">
                                    {stats.submissions}
                                </div>
                                <span className="text-amber-400 font-bold text-xs font-mono">Graded</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                            <h4 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
                                System Administration Tasks
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h5 className="font-bold text-white text-sm">User Directory & Accounts</h5>
                                        <p className="text-xs text-slate-400 mt-0.5">Register instructors, manage trainee cohorts, and reset passwords.</p>
                                    </div>
                                    <Link
                                        href={route('admin.users.index')}
                                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shrink-0"
                                    >
                                        Manage Users
                                    </Link>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h5 className="font-bold text-white text-sm">💾 Database Backups & Recovery</h5>
                                        <p className="text-xs text-slate-400 mt-0.5">Generate on-demand SQL dump snapshots and restore database state.</p>
                                    </div>
                                    <Link
                                        href={route('admin.backups.index')}
                                        className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shrink-0"
                                    >
                                        Backups Console
                                    </Link>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h5 className="font-bold text-white text-sm">📜 System Activity Audit Trail</h5>
                                        <p className="text-xs text-slate-400 mt-0.5">Inspect user logins, lab lifecycle events, and export CSV audit logs.</p>
                                    </div>
                                    <Link
                                        href={route('admin.logs.index')}
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shrink-0"
                                    >
                                        View Audit Trail
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 h-fit">
                            <h4 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
                                System Telemetry
                            </h4>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                                    <span className="text-slate-400">Database Engine:</span>
                                    <span className="font-mono text-sky-400 font-bold">MySQL Database</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                                    <span className="text-slate-400">Environment Mode:</span>
                                    <span className="text-white font-bold">Local Host / LAN</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                                    <span className="text-slate-400">Audit Logging:</span>
                                    <span className="text-emerald-400 font-bold">🟢 Active</span>
                                </div>
                                <div className="flex justify-between py-2 text-slate-300">
                                    <span className="text-slate-400">Soft Deletes:</span>
                                    <span className="text-emerald-400 font-bold">🟢 Enabled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
