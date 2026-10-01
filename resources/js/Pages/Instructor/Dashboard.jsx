import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function InstructorDashboard({ coursesCount, labsCount, traineesCount, trainees = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Instructor Management Suite
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Cohort assignment, hardware lab simulations, automated grading, and syllabus tracking.
                        </p>
                    </div>
                    <span className="rounded-xl border border-emerald-800 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-300">
                        👨‍🏫 Instructor Control
                    </span>
                </div>
            }
        >
            <Head title="Instructor Dashboard" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* Welcome Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
                        <div className="p-8 text-white">
                            <h3 className="text-2xl font-black">Hardware Training Console</h3>
                            <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
                                Assign assembly tasks, configure UEFI BIOS simulations, setup Motherboard Hotspots, grade fault repair reports, and track trainee progress.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Active Trainees
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">{traineesCount}</div>
                                <span className="text-emerald-400 font-bold text-xs">Enrolled</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Courses & Syllabus
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">{coursesCount}</div>
                                <span className="text-sky-400 font-bold text-xs">Active</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Interactive Labs
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <div className="text-3xl font-black text-white">{labsCount}</div>
                                <span className="text-purple-400 font-bold text-xs">Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-300 font-bold mb-4">
                                    🔬
                                </div>
                                <h4 className="text-base font-bold text-white">Simulation Labs & Lifecycle</h4>
                                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                    Activate/deactivate practical simulators, configure expiration windows, and manage soft deleted labs.
                                </p>
                            </div>
                            <div className="mt-6 border-t border-slate-800 pt-4">
                                <Link
                                    href={route('instructor.labs.index')}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center block"
                                >
                                    Manage Simulation Labs
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl flex flex-col justify-between hover:border-sky-500/50 transition">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-sky-950/80 border border-sky-700/80 flex items-center justify-center text-sky-300 font-bold mb-4">
                                    📋
                                </div>
                                <h4 className="text-base font-bold text-white">Curriculum & Course Editor</h4>
                                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                    Structure course modules, curriculum outlines, and define hardware training prerequisites.
                                </p>
                            </div>
                            <div className="mt-6 border-t border-slate-800 pt-4">
                                <Link
                                    href={route('instructor.courses.index')}
                                    className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center block"
                                >
                                    Course Curriculum
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-blue-950/80 border border-blue-700/80 flex items-center justify-center text-blue-300 font-bold mb-4">
                                    👥
                                </div>
                                <h4 className="text-base font-bold text-white">Trainee Cohorts & Accounts</h4>
                                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                    Bulk register students via CSV, assign specific simulation practicals, and monitor scorecards.
                                </p>
                            </div>
                            <div className="mt-6 border-t border-slate-800 pt-4">
                                <Link
                                    href={route('instructor.trainees.index')}
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center block"
                                >
                                    Manage Trainees
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Trainees List Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                        <h4 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                            <span>Recently Enrolled Trainees</span>
                            <Link href={route('instructor.trainees.index')} className="text-xs text-blue-400 hover:underline">
                                View Full Directory &raquo;
                            </Link>
                        </h4>
                        {trainees.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No trainee accounts registered yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Full Name</th>
                                            <th className="px-4 py-3">Email Address</th>
                                            <th className="px-4 py-3">Registration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {trainees.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-800/50 transition">
                                                <td className="px-4 py-3.5 font-bold text-white">{t.name}</td>
                                                <td className="px-4 py-3.5 font-mono text-slate-400">{t.email}</td>
                                                <td className="px-4 py-3.5 text-slate-400 font-mono">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
