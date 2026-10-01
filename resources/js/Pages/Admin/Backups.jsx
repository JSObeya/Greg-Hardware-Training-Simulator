import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Backups({ backups = [], dbInfo = {} }) {
    const createForm = useForm({});
    const [restoringFile, setRestoringFile] = useState(null);
    const [deletingFile, setDeletingFile] = useState(null);

    const handleCreateBackup = () => {
        createForm.post(route('admin.backups.create'), {
            preserveScroll: true,
        });
    };

    const handleRestoreConfirm = () => {
        if (!restoringFile) return;
        router.post(route('admin.backups.restore', restoringFile), {}, {
            preserveScroll: true,
            onFinish: () => setRestoringFile(null),
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingFile) return;
        router.delete(route('admin.backups.destroy', deletingFile), {
            preserveScroll: true,
            onFinish: () => setDeletingFile(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            💾 Database Backups & System Recovery
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Create on-demand SQL dump archives, download offline backups, and restore database state.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateBackup}
                        disabled={createForm.processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                    >
                        <span>⚡</span>
                        <span>{createForm.processing ? 'Generating Backup...' : 'Generate Backup Now'}</span>
                    </button>
                </div>
            }
        >
            <Head title="Database Backups - Admin" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Database Metadata Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Database Name
                            </span>
                            <div className="text-lg font-black text-white flex items-center gap-2">
                                <span>🗄️</span>
                                <span>{dbInfo.database}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Driver: <strong className="uppercase text-blue-400">{dbInfo.driver}</strong>
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Backup Archive Repository
                            </span>
                            <div className="text-lg font-black text-white flex items-center gap-2">
                                <span>📦</span>
                                <span>{backups.length} Archive(s)</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block truncate" title={dbInfo.backup_path}>
                                Path: storage/app/backups
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Latest Backup
                            </span>
                            <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
                                <span>✅</span>
                                <span>{backups.length > 0 ? backups[0].created_at : 'No backups yet'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Format: Full SQL DDL & Table Rows
                            </span>
                        </div>
                    </div>

                    {/* Backups Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                            <h3 className="text-base font-bold text-white">
                                Available Backup Archives
                            </h3>
                            <span className="text-xs text-slate-400">
                                Sorted by most recent
                            </span>
                        </div>

                        {backups.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <span className="text-3xl block mb-2">📁</span>
                                <p className="font-semibold text-sm text-slate-300">No backup archives generated yet.</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Click "Generate Backup Now" to create your first on-demand snapshot.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Archive File</th>
                                            <th className="px-6 py-3.5">File Size</th>
                                            <th className="px-6 py-3.5">Creation Timestamp</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {backups.map((b) => (
                                            <tr key={b.filename} className="hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4 font-mono font-bold text-white flex items-center gap-2">
                                                    <span className="text-blue-400 text-base">📄</span>
                                                    <span>{b.filename}</span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-300">
                                                    {b.size_formatted}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                                                    {b.created_at}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <a
                                                            href={route('admin.backups.download', b.filename)}
                                                            className="rounded-xl border border-blue-800/80 bg-blue-950/60 text-blue-300 hover:bg-blue-900 px-3 py-1.5 font-bold transition flex items-center gap-1"
                                                        >
                                                            <span>📥</span> Download
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRestoringFile(b.filename)}
                                                            className="rounded-xl border border-amber-800/80 bg-amber-950/60 text-amber-300 hover:bg-amber-900 px-3 py-1.5 font-bold transition flex items-center gap-1"
                                                        >
                                                            <span>🔄</span> Restore
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingFile(b.filename)}
                                                            className="rounded-xl border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900 px-3 py-1.5 font-bold transition flex items-center gap-1"
                                                        >
                                                            <span>🗑️</span> Delete
                                                        </button>
                                                    </div>
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

            {/* Restore Confirmation Modal */}
            {restoringFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 flex items-center justify-center text-xl font-bold mx-auto">
                            ⚠️
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">
                                Confirm Database Restoration
                            </h3>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                Are you sure you want to restore database state from <strong className="text-amber-300">{restoringFile}</strong>? Current tables will be replaced with this archive's snapshot.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setRestoringFile(null)}
                                className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRestoreConfirm}
                                className="w-1/2 rounded-xl bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-bold text-white transition shadow-md"
                            >
                                Yes, Restore Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-700/80 text-rose-300 flex items-center justify-center text-xl font-bold mx-auto">
                            🗑️
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">
                                Delete Backup Archive
                            </h3>
                            <p className="text-xs text-slate-300 mt-2">
                                Are you sure you want to permanently delete <strong className="text-rose-300">{deletingFile}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingFile(null)}
                                className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="w-1/2 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white transition shadow-md"
                            >
                                Delete Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
