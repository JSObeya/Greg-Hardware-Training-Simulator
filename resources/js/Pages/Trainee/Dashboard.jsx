import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function TraineeDashboard({ assignments = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Separate active assignments from completed ones
    const activeAssignments = assignments.filter(a => a.status !== 'completed');
    const completedAssignments = assignments.filter(a => a.status === 'completed');

    const getLabTypeMeta = (type) => {
        switch (type) {
            case 'bios_config':
                return { icon: '💻', label: 'UEFI BIOS Utility', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' };
            case 'cable_pinout':
                return { icon: '🔌', label: 'PSU & Front Cables', bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60' };
            case 'beep_code_diagnostic':
                return { icon: '🔊', label: 'POST Diagnostic Beeps', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60' };
            case 'component_id':
                return { icon: '🧩', label: 'Component Identification', bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60' };
            case 'motherboard_hotspot':
                return { icon: '🎯', label: 'Motherboard Hotspot', bg: 'bg-teal-950/80 text-teal-300 border-teal-700/60' };
            case 'assembly_sequence':
                return { icon: '🛠️', label: 'Assembly Sequence', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' };
            case 'drag_drop_build':
                return { icon: '🧱', label: 'Chassis PC Builder', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' };
            case 'troubleshooting':
                return { icon: '🔍', label: 'Troubleshooting Scenario', bg: 'bg-orange-950/80 text-orange-300 border-orange-700/60' };
            case 'preventive_maintenance':
                return { icon: '🧹', label: 'Maintenance & SOPs', bg: 'bg-lime-950/80 text-lime-300 border-lime-700/60' };
            case 'repair_report':
                return { icon: '📝', label: 'Service Repair Report', bg: 'bg-rose-950/80 text-rose-300 border-rose-700/60' };
            default:
                return { icon: '🔬', label: type ? type.replace(/_/g, ' ') : 'Hardware Lab', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-0.5 text-[10px] font-bold uppercase">Completed</span>;
            case 'in_progress':
                return <span className="rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2.5 py-0.5 text-[10px] font-bold uppercase">In Progress</span>;
            default:
                return <span className="rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/60 px-2.5 py-0.5 text-[10px] font-bold uppercase">Assigned</span>;
        }
    };

    const filteredAssignments = activeAssignments.filter((a) => {
        const titleMatch = a.lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (a.lab.module?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = categoryFilter === 'all' || a.lab.type === categoryFilter;
        return titleMatch && typeMatch;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            🔬 Practical Hardware Simulation Labs
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Interactive hardware diagnostics, assembly workstations, UEFI BIOS utilities, and automated evaluations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-950/60 border border-blue-800/80 px-3.5 py-1.5 text-xs font-bold text-blue-300">
                            <span>🎓</span>
                            <span>{activeAssignments.length} Active Lab(s)</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                            <span>✅</span>
                            <span>{completedAssignments.length} Completed</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Simulation Labs - Trainee" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                            {[
                                { key: 'all', label: 'All Labs' },
                                { key: 'bios_config', label: '💻 UEFI BIOS' },
                                { key: 'cable_pinout', label: '🔌 PSU & Cables' },
                                { key: 'beep_code_diagnostic', label: '🔊 POST Beeps' },
                                { key: 'component_id', label: '🧩 Components' },
                                { key: 'assembly_sequence', label: '🛠️ Assembly' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setCategoryFilter(f.key)}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        categoryFilter === f.key
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search practical labs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 w-64"
                            />
                        </div>
                    </div>

                    {/* ================= LABS GRID CARD LAYOUT ================= */}
                    {filteredAssignments.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400">
                            <span className="text-4xl block mb-3">🔬</span>
                            <p className="font-bold text-base text-slate-200">
                                No simulation labs found matching your filter.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Clear your search or check back when new simulation practicals are assigned.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssignments.map((a) => {
                                const isLabActive = a.lab.is_active !== false;
                                const isExpired = a.lab.expires_at && new Date(a.lab.expires_at) < new Date();
                                const canLaunch = isLabActive && !isExpired;
                                const typeMeta = getLabTypeMeta(a.lab.type);

                                return (
                                    <div
                                        key={a.id}
                                        className="rounded-2xl border border-slate-800 hover:border-blue-500/60 bg-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        {/* Card Top / Header */}
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border ${typeMeta.bg}`}>
                                                    <span>{typeMeta.icon}</span>
                                                    <span>{typeMeta.label}</span>
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    {getStatusBadge(a.status)}
                                                </div>
                                            </div>

                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                                                {a.lab.module?.course?.title} &raquo; {a.lab.module?.title}
                                            </span>

                                            <h4 className="text-base font-black text-white leading-snug group-hover:text-blue-400 transition">
                                                {a.lab.title}
                                            </h4>

                                            <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed font-normal">
                                                {a.lab.description || 'Hands-on practical workstation simulator with automated step verification.'}
                                            </p>
                                        </div>

                                        {/* Card Bottom / Badges & Action */}
                                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3.5">
                                            <div className="flex items-center justify-between text-xs text-slate-300">
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                                                    <span>🎯</span> {a.lab.passing_score}% Pass Score
                                                </span>
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                                                    <span>⏱️</span> {a.lab.time_limit ? `${a.lab.time_limit} Mins` : 'Unlimited'}
                                                </span>
                                            </div>

                                            {/* Status / Expiration warnings */}
                                            {!isLabActive ? (
                                                <div className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                    <span>🔒</span>
                                                    <span>Lab Deactivated by Instructor</span>
                                                </div>
                                            ) : isExpired ? (
                                                <div className="rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/80 px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
                                                    <span>⚠️</span>
                                                    <span>Expired: {new Date(a.lab.expires_at).toLocaleDateString()}</span>
                                                </div>
                                            ) : a.lab.expires_at ? (
                                                <div className="rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/80 px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
                                                    <span>⏳</span>
                                                    <span>Access until {new Date(a.lab.expires_at).toLocaleDateString()}</span>
                                                </div>
                                            ) : null}

                                            {/* Action Button */}
                                            <div className="pt-1">
                                                {canLaunch ? (
                                                    <Link
                                                        href={route('trainee.labs.show', a.id)}
                                                        className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition text-center flex items-center justify-center gap-1.5 ${
                                                            a.status === 'in_progress'
                                                                ? 'bg-amber-600 hover:bg-amber-500'
                                                                : 'bg-blue-600 hover:bg-blue-500'
                                                        }`}
                                                    >
                                                        <span>{a.status === 'in_progress' ? '▶️' : '🚀'}</span>
                                                        <span>{a.status === 'in_progress' ? 'Resume Simulator' : 'Start Simulation'}</span>
                                                    </Link>
                                                ) : (
                                                    <div className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-500 py-2.5 text-xs font-bold text-center select-none cursor-not-allowed">
                                                        {isExpired ? 'Simulation Closed' : 'Unavailable'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom Section: Completed Labs Review */}
                    {completedAssignments.length > 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <h4 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                                <span>🏆</span>
                                <span>Completed Simulation Runs ({completedAssignments.length})</span>
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {completedAssignments.map((a) => {
                                    const bestAttempt = a.attempts
                                        ?.filter(att => att.status === 'graded')
                                        ?.sort((x, y) => (y.score ?? 0) - (x.score ?? 0))[0];

                                    const typeMeta = getLabTypeMeta(a.lab.type);

                                    return (
                                        <div
                                            key={a.id}
                                            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                                    <span>{typeMeta.icon}</span>
                                                    <span>{a.lab.title}</span>
                                                </div>
                                                <span className="text-[10px] text-blue-400 block mt-0.5">
                                                    {a.lab.module?.title}
                                                </span>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-base font-black text-emerald-400">
                                                    {bestAttempt ? `${Math.round(bestAttempt.score)}%` : 'Submitted'}
                                                </div>
                                                <Link
                                                    href={route('trainee.labs.show', a.id)}
                                                    className="text-[10px] font-bold text-blue-400 hover:underline block"
                                                >
                                                    Review Run &raquo;
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
