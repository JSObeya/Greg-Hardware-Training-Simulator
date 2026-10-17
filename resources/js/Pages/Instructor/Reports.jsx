import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Reports({ attempts = [], kpis = {}, filters = {}, filterOptions = {} }) {
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || 'all');
    const [selectedLab, setSelectedLab] = useState(filters.lab_id || 'all');
    const [selectedCohort, setSelectedCohort] = useState(filters.cohort || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleApplyFilters = (e) => {
        e?.preventDefault();
        router.get(route('instructor.reports.index'), {
            course_id: selectedCourse !== 'all' ? selectedCourse : undefined,
            lab_id: selectedLab !== 'all' ? selectedLab : undefined,
            cohort: selectedCohort !== 'all' ? selectedCohort : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setSelectedCourse('all');
        setSelectedLab('all');
        setSelectedCohort('all');
        setSelectedStatus('all');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');
        router.get(route('instructor.reports.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getCsvExportUrl = () => {
        const params = new URLSearchParams();
        if (selectedCourse !== 'all') params.append('course_id', selectedCourse);
        if (selectedLab !== 'all') params.append('lab_id', selectedLab);
        if (selectedCohort !== 'all') params.append('cohort', selectedCohort);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        if (searchTerm) params.append('search', searchTerm);
        return `${route('instructor.reports.export-csv')}?${params.toString()}`;
    };

    const getLabTypeBadge = (type) => {
        switch (type) {
            case 'bios_config':
                return { icon: '💻', label: 'UEFI BIOS', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' };
            case 'visual_wiring':
            case 'cable_pinout':
                return { icon: '🔌', label: 'Wiring & Pinout', bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60' };
            case 'beep_code_diagnostic':
                return { icon: '🔊', label: 'POST Beeps', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60' };
            case 'component_id':
                return { icon: '🧩', label: 'Component ID', bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60' };
            case 'motherboard_hotspot':
                return { icon: '🎯', label: 'Motherboard', bg: 'bg-teal-950/80 text-teal-300 border-teal-700/60' };
            case 'assembly_sequence':
                return { icon: '🛠️', label: 'Assembly', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' };
            default:
                return { icon: '🔬', label: type ? type.replace(/_/g, ' ') : 'Hardware Lab', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/80 uppercase tracking-widest font-mono">
                                Institutional Analytics & Gradebook
                            </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-white mt-1">
                            Universal Multi-Lab Custom Report Builder & Cohorts
                        </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href={getCsvExportUrl()}
                            className="rounded-xl border border-emerald-600 bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-md flex items-center gap-1.5"
                            download
                        >
                            <span>📥 Export to CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <span>🖨️ Print Report</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Universal Multi-Lab Custom Reports & Cohorts" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Executive KPI Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</div>
                            <div className="text-2xl font-black text-white mt-1 font-mono">{kpis.total_attempts || 0}</div>
                            <div className="text-[10px] text-blue-400 mt-1 font-semibold">{kpis.unique_trainees || 0} unique trainees</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Average</div>
                            <div className={`text-2xl font-black mt-1 font-mono ${
                                (kpis.avg_score || 0) >= 70 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {kpis.avg_score || 0}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Passing benchmark: 70%</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Pass Rate</div>
                            <div className={`text-2xl font-black mt-1 font-mono ${
                                (kpis.pass_rate || 0) >= 80 ? 'text-emerald-400' : (kpis.pass_rate || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                                {kpis.pass_rate || 0}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Of completed runs</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety & ESD Score</div>
                            <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{kpis.avg_safety_score || 100}%</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Anti-static compliance</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Completion</div>
                            <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{kpis.avg_duration_minutes || 0} <span className="text-xs font-normal">min</span></div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Workstation time</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Cohorts</div>
                            <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">{(filterOptions.cohorts || []).length}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Assigned batches</div>
                        </div>
                    </div>

                    {/* Multi-Parameter Query Console */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>⚙️</span>
                                <span>Multi-Lab Filter & Aggregation Console</span>
                            </h3>
                            <span className="text-xs text-slate-400">
                                Filter by cohort, course, lab type, status, or date range
                            </span>
                        </div>

                        <form onSubmit={handleApplyFilters} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                
                                {/* Cohort Filter */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Cohort / Class Batch
                                    </label>
                                    <select
                                        value={selectedCohort}
                                        onChange={(e) => setSelectedCohort(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="all">All Cohorts</option>
                                        {(filterOptions.cohorts || []).map((coh) => (
                                            <option key={coh} value={coh}>{coh}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Course Filter */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Course Curriculum
                                    </label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="all">All Courses</option>
                                        {(filterOptions.courses || []).map((crs) => (
                                            <option key={crs.id} value={crs.id}>{crs.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lab Simulator Station */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Lab Station
                                    </label>
                                    <select
                                        value={selectedLab}
                                        onChange={(e) => setSelectedLab(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="all">All Labs</option>
                                        {(filterOptions.labs || []).map((lb) => (
                                            <option key={lb.id} value={lb.id}>{lb.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Outcome Status */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Evaluation Outcome
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="all">All Outcomes</option>
                                        <option value="passed">Passed (Score ≥ 70%)</option>
                                        <option value="failed">Failed (Score &lt; 70%)</option>
                                        <option value="submitted">Submitted (Pending Review)</option>
                                        <option value="started">In Progress</option>
                                    </select>
                                </div>

                                {/* Date From */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Completed From
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    />
                                </div>

                                {/* Date To */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Completed To
                                    </label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    />
                                </div>

                                {/* Trainee Search */}
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Search Trainee (Name or Email)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Type trainee name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-semibold transition"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold transition shadow-md"
                                >
                                    Apply Multi-Filter Query
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Data Results Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-white">
                                    Consolidated Submissions Matrix
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                    Showing {attempts.length} record(s) matching current query criteria
                                </p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">
                                Auto-Graded + Instructor Validated
                            </span>
                        </div>

                        {attempts.length === 0 ? (
                            <div className="p-16 text-center text-slate-400 space-y-2">
                                <span className="text-3xl block">📋</span>
                                <p className="font-bold text-sm text-slate-200">No submission records match your query.</p>
                                <p className="text-xs text-slate-500">Adjust the filters above or reset to view all trainee submissions.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5">Trainee & Cohort</th>
                                            <th className="px-5 py-3.5">Lab Station</th>
                                            <th className="px-5 py-3.5">Mode</th>
                                            <th className="px-5 py-3.5">Score</th>
                                            <th className="px-5 py-3.5">Safety / ESD</th>
                                            <th className="px-5 py-3.5">Outcome</th>
                                            <th className="px-5 py-3.5">Duration</th>
                                            <th className="px-5 py-3.5">Completed Date</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {attempts.map((att) => {
                                            const typeMeta = getLabTypeBadge(att.lab_type);
                                            return (
                                                <tr key={att.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-white">{att.trainee_name}</div>
                                                        <div className="text-[10px] text-slate-400">{att.trainee_email}</div>
                                                        <span className="inline-block mt-1 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[9px] font-mono px-1.5 py-0.2">
                                                            {att.cohort}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-200">{att.lab_title}</div>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase border ${typeMeta.bg}`}>
                                                                <span>{typeMeta.icon}</span>
                                                                <span>{typeMeta.label}</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                                            att.is_practice
                                                                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700/80'
                                                                : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80'
                                                        }`}>
                                                            {att.is_practice ? '🧪 Practice' : '🏆 Graded'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {att.score !== null ? (
                                                            <div className="space-y-1">
                                                                <span className={`text-sm font-black font-mono ${
                                                                    att.score >= att.passing_score ? 'text-emerald-400' : 'text-rose-400'
                                                                }`}>
                                                                    {att.score}%
                                                                </span>
                                                                <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${att.score >= att.passing_score ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                        style={{ width: `${Math.min(att.score, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500 font-mono text-[11px]">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-mono text-cyan-300 font-bold">
                                                            {att.safety_score}%
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {att.status === 'started' ? (
                                                            <span className="inline-flex rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 text-[10px] font-bold">
                                                                ⏳ In Progress
                                                            </span>
                                                        ) : att.is_passed ? (
                                                            <span className="inline-flex rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                                                                ✅ PASSED
                                                            </span>
                                                        ) : att.score !== null ? (
                                                            <span className="inline-flex rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 px-2.5 py-0.5 text-[10px] font-bold">
                                                                ❌ FAILED
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-amber-950/80 text-amber-300 border border-amber-700 px-2 py-0.5 text-[10px] font-bold">
                                                                📝 SUBMITTED
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-300 font-mono text-[11px]">
                                                        {att.duration_minutes !== null ? `${att.duration_minutes}m` : '--'}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-400 text-[11px] font-mono">
                                                        {att.completed_at}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            href={route('instructor.submissions.review', att.id)}
                                                            className="rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white px-2.5 py-1 text-[11px] font-bold transition inline-block shadow-sm"
                                                        >
                                                            Review Attempt
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
