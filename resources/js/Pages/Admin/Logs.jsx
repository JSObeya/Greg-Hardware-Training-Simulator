import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Logs({ logs, usersList = [], filters = {} }) {
    const logData = logs.data || [];
    const links = logs.links || [];

    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(route('admin.logs.index'), {
            search: search || undefined,
            action: action || undefined,
            user_id: userId || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setAction('');
        setUserId('');
        setStartDate('');
        setEndDate('');
        router.get(route('admin.logs.index'));
    };

    const getCsvExportUrl = () => {
        const params = new URLSearchParams({
            export: 'csv',
            ...(search && { search }),
            ...(action && { action }),
            ...(userId && { user_id: userId }),
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
        });
        return `${route('admin.logs.index')}?${params.toString()}`;
    };

    const getActionBadgeColor = (act) => {
        if (act.includes('DELETE') || act.includes('SUSPEND') || act.includes('FORCE')) {
            return 'bg-rose-950/80 text-rose-300 border border-rose-800/80';
        }
        if (act.includes('CREATE') || act.includes('RESTORE')) {
            return 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80';
        }
        if (act.includes('BACKUP')) {
            return 'bg-purple-950/80 text-purple-300 border border-purple-700/80';
        }
        if (act.includes('AUTH') || act.includes('PASSWORD') || act.includes('LOGIN')) {
            return 'bg-amber-950/80 text-amber-300 border border-amber-700/80';
        }
        if (act.includes('SUBMIT') || act.includes('GRADE') || act.includes('START')) {
            return 'bg-blue-950/80 text-blue-300 border border-blue-700/80';
        }
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            📜 System Audit Trail & Activity Logs
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Chronological compliance logs for logins, administrative edits, lab lifecycle events, and backups.
                        </p>
                    </div>

                    <a
                        href={getCsvExportUrl()}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
                    >
                        <span>📥</span>
                        <span>Export Audit Trail to CSV</span>
                    </a>
                </div>
            }
        >
            <Head title="System Audit Logs - Admin" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Filter Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Keyword / IP Search
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search details or IP..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Action Category
                                </label>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">All Action Types</option>
                                    <option value="USER">User Management (USER_*)</option>
                                    <option value="TRAINEE">Trainee Management (TRAINEE_*)</option>
                                    <option value="LAB">Lab Lifecycle (LAB_*)</option>
                                    <option value="BACKUP">Database Backups (DB_BACKUP_*)</option>
                                    <option value="AUTH">Authentication Events</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Operator / Actor
                                </label>
                                <select
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">All Users / Operators</option>
                                    {usersList.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </form>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleFilterSubmit}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 shadow-md transition"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 border border-slate-700 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>

                            <span className="text-slate-400 text-[11px]">
                                Total Logged Events: <strong className="text-slate-200">{logs.total || 0}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Logs Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <h3 className="text-base font-bold text-white">
                                Audit Log Stream
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                                Page {logs.current_page} of {logs.last_page}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Timestamp</th>
                                        <th className="px-6 py-3.5">Operator / Role</th>
                                        <th className="px-6 py-3.5">Action</th>
                                        <th className="px-6 py-3.5">Audit Details</th>
                                        <th className="px-6 py-3.5">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                    {logData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                No audit log records match the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        logData.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">
                                                        {log.user ? log.user.name : 'System / Guest'}
                                                    </div>
                                                    {log.user && (
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {log.user.email} &bull; <span className="uppercase text-blue-400 font-bold">{log.user.role?.name || 'Trainee'}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-200 leading-relaxed font-normal">
                                                    {log.details}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                                    {log.ip_address || '127.0.0.1'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {links.length > 3 && (
                            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
                                <div className="text-slate-400">
                                    Showing {logs.from} to {logs.to} of {logs.total} events
                                </div>
                                <div className="flex gap-1.5">
                                    {links.map((link, idx) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-600 text-[11px] font-bold select-none cursor-default bg-slate-900"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                                                    link.active
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
