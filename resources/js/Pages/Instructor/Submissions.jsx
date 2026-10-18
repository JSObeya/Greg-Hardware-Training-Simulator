import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Submissions({ attempts = [] }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        action: null,
        targetId: null,
        title: '',
        message: '',
    });

    const isAllSelected = attempts.length > 0 && attempts.every((att) => selectedIds.includes(att.id));
    const isSomeSelected = attempts.some((att) => selectedIds.includes(att.id)) && !isAllSelected;

    const handleToggleAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(attempts.map((att) => att.id));
        }
    };

    const handleToggleRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleExportBatch = (format) => {
        if (selectedIds.length === 0) return;
        const params = new URLSearchParams();
        params.append('format', format);
        params.append('attempt_ids', selectedIds.join(','));
        params.append('group_by', 'trainee');
        window.location.href = `${route('instructor.reports.export-batch')}?${params.toString()}`;
    };

    const executeConfirmedAction = () => {
        const { action, targetId } = confirmModal;
        setConfirmModal({ open: false, action: null, targetId: null, title: '', message: '' });

        if (action === 'delete_single' && targetId) {
            router.delete(route('instructor.reports.destroy', targetId), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== targetId));
                },
            });
        } else if (action === 'delete_bulk' && selectedIds.length > 0) {
            router.post(route('instructor.reports.bulk-delete'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Trainee Lab Submissions &amp; Gradebook
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Review, grade, and export trainee service reports and simulation runs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('instructor.reports.index')}
                            className="rounded-xl border border-blue-600 bg-blue-600/90 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-md flex items-center gap-1.5"
                        >
                            <span>📊 Universal Multi-Lab Reports</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <span>🖨️ Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Submissions Tracker" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Multi-Select Action Banner */}
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-950/90 border border-blue-700/80 p-4 rounded-2xl shadow-xl print:hidden animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-200">
                                    🎯 {selectedIds.length} of {attempts.length} submission(s) selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs text-slate-400 hover:text-white underline ml-2"
                                >
                                    Deselect all
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleExportBatch('docx')}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                >
                                    <span>📘 Export Word (.docx)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportBatch('pdf')}
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                >
                                    <span>📕 Export PDF (.pdf)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-bold border border-slate-700 transition"
                                >
                                    <span>🖨️ Print Selected</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmModal({
                                            open: true,
                                            action: 'delete_bulk',
                                            title: 'Move Selected to Trash?',
                                            message: `Move ${selectedIds.length} submission(s) to trash (soft delete)? They can be restored at any time.`,
                                        });
                                    }}
                                    className="rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-700 text-rose-300 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
                                >
                                    <span>🗑️ Move to Trash</span>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <div>
                                <h3 className="text-base font-bold text-white">Active Submissions Tracker</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Chronological stream of trainee simulation attempts and service diagnostics.
                                </p>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                                Total: {attempts.length}
                            </span>
                        </div>

                        {attempts.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="text-3xl block mb-2">📝</span>
                                <p className="font-semibold text-sm text-slate-300">No trainee lab submissions yet.</p>
                                <p className="text-xs text-slate-500 mt-1">When trainees complete simulator workstations, runs will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4 w-10 text-center print:hidden">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={(el) => {
                                                        if (el) el.indeterminate = isSomeSelected;
                                                    }}
                                                    onChange={handleToggleAll}
                                                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                />
                                            </th>
                                            <th className="py-3.5 px-5">Trainee</th>
                                            <th className="py-3.5 px-5">Lab Title</th>
                                            <th className="py-3.5 px-5">Completed Date</th>
                                            <th className="py-3.5 px-5">Score</th>
                                            <th className="py-3.5 px-5">Status</th>
                                            <th className="py-3.5 px-5 text-right print:hidden">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {attempts.map((attempt) => {
                                            const isRowSelected = selectedIds.includes(attempt.id);
                                            return (
                                                <tr
                                                    key={attempt.id}
                                                    className={`transition ${
                                                        isRowSelected ? 'bg-blue-950/40' : 'hover:bg-slate-800/50'
                                                    }`}
                                                >
                                                    <td className="py-4 px-4 text-center print:hidden">
                                                        <input
                                                            type="checkbox"
                                                            checked={isRowSelected}
                                                            onChange={() => handleToggleRow(attempt.id)}
                                                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <div className="font-bold text-white">{attempt.trainee?.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{attempt.trainee?.email}</div>
                                                    </td>
                                                    <td className="py-4 px-5 font-semibold text-white">
                                                        {attempt.assignment?.lab?.display_title || attempt.assignment?.lab?.title}
                                                        <div className="text-[10px] text-blue-400 font-normal">
                                                            {attempt.assignment?.lab?.module?.course?.title}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                                                        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-5 font-black text-sm text-emerald-400 font-mono">
                                                        {attempt.score !== null ? `${round(Number(attempt.score), 1)}%` : 'Pending'}
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                            attempt.status === 'graded'
                                                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                                                : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                                                        }`}>
                                                            {attempt.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap print:hidden">
                                                        <Link
                                                            href={route('instructor.submissions.review', attempt.id)}
                                                            className="inline-flex rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
                                                        >
                                                            {attempt.status === 'graded' ? 'Review' : 'Grade'}
                                                        </Link>
                                                        
                                                        <a
                                                            href={route('instructor.submissions.pdf', attempt.id)}
                                                            className="inline-flex rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 text-xs font-bold border border-slate-700 transition"
                                                            title="Download PDF Service Report"
                                                        >
                                                            📄 PDF
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    open: true,
                                                                    action: 'delete_single',
                                                                    targetId: attempt.id,
                                                                    title: 'Move Submission to Trash?',
                                                                    message: `Move attempt #${attempt.id} (${attempt.trainee?.name}) to trash? You can restore it anytime in Multi-Lab Reports.`,
                                                                });
                                                            }}
                                                            className="inline-flex rounded-xl bg-slate-800 hover:bg-rose-900 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-200 px-2.5 py-1.5 text-xs font-bold transition"
                                                            title="Soft Delete"
                                                        >
                                                            🗑️
                                                        </button>
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

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 animate-scaleUp">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>⚠️ {confirmModal.title}</span>
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ open: false, action: null, targetId: null, title: '', message: '' })}
                                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeConfirmedAction}
                                className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 text-xs font-bold transition shadow-md"
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
