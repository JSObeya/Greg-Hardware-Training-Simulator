import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Labs({ labs = [], modules = [], tab = 'active', search: initSearch = '', counts = {} }) {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initSearch || '');
    const [expiringLab, setExpiringLab] = useState(null);
    const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'table'

    const { data, setData, post, processing, errors, reset } = useForm({
        module_id: '',
        title: '',
        description: '',
        type: 'component_id',
        passing_score: 70,
        time_limit: '',
        is_active: true,
        expires_at: '',
    });

    const expirationForm = useForm({
        expires_at: '',
        days_duration: '',
    });

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        router.get(route('instructor.labs.index'), {
            tab: tab,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('instructor.labs.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleToggleStatus = (lab) => {
        router.post(route('instructor.labs.toggle-status', lab.id), {}, {
            preserveScroll: true,
        });
    };

    const openExpirationModal = (lab) => {
        setExpiringLab(lab);
        expirationForm.setData({
            expires_at: lab.expires_at ? lab.expires_at.slice(0, 16) : '',
            days_duration: '',
        });
    };

    const handleExpirationSubmit = (e) => {
        e.preventDefault();
        if (!expiringLab) return;

        expirationForm.post(route('instructor.labs.set-expiration', expiringLab.id), {
            preserveScroll: true,
            onSuccess: () => setExpiringLab(null),
        });
    };

    const handleSetDurationPreset = (days) => {
        if (!expiringLab) return;
        router.post(route('instructor.labs.set-expiration', expiringLab.id), {
            days_duration: days,
        }, {
            preserveScroll: true,
            onSuccess: () => setExpiringLab(null),
        });
    };

    const handleClearExpiration = () => {
        if (!expiringLab) return;
        router.post(route('instructor.labs.set-expiration', expiringLab.id), {
            expires_at: null,
        }, {
            preserveScroll: true,
            onSuccess: () => setExpiringLab(null),
        });
    };

    const handleSoftDelete = (lab) => {
        if (!confirm(`Are you sure you want to move "${lab.title}" to Trash?`)) return;
        router.delete(route('instructor.labs.destroy', lab.id), {
            preserveScroll: true,
        });
    };

    const handleRestore = (id) => {
        router.post(route('instructor.labs.restore', id), {}, {
            preserveScroll: true,
        });
    };

    const handleForceDelete = (id, title) => {
        if (!confirm(`PERMANENT DELETION: Are you sure you want to permanently delete "${title}"?`)) return;
        router.delete(route('instructor.labs.force-delete', id), {
            preserveScroll: true,
        });
    };

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

    const getExpirationStatus = (lab) => {
        if (!lab.expires_at) {
            return { text: '♾️ Perpetual Access', color: 'text-slate-300 bg-slate-800/90 border-slate-700' };
        }
        const expDate = new Date(lab.expires_at);
        const now = new Date();
        if (now > expDate) {
            return { text: `⚠️ Expired: ${expDate.toLocaleDateString()}`, color: 'text-rose-300 bg-rose-950/80 border-rose-800/80' };
        }
        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        return { text: `⏳ Expires in ${diffDays} day(s)`, color: 'text-amber-300 bg-amber-950/80 border-amber-800/80' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            🔬 Simulation Labs Manager & Lifecycle
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Interactive hardware simulators, activation lifecycle, expiration windows, and trash recovery.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                        {showForm ? '✕ Close Form' : '+ Create New Simulator'}
                    </button>
                </div>
            }
        >
            <Head title="Simulation Labs - Instructor" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* New Lab Creation Form */}
                    {showForm && (
                        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl p-6 max-w-xl mx-auto">
                            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
                                Setup Simulation Lab
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Curriculum Module
                                    </label>
                                    <select
                                        value={data.module_id}
                                        onChange={(e) => setData('module_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">-- Select Module --</option>
                                        {modules.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.course.title} - {m.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.module_id && <div className="text-xs text-rose-400 mt-1">{errors.module_id}</div>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Lab Title
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g. UEFI BIOS Configuration & Overclocking"
                                        required
                                    />
                                    {errors.title && <div className="text-xs text-rose-400 mt-1">{errors.title}</div>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Description & Objectives
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Simulator Type</label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white focus:border-blue-500"
                                            required
                                        >
                                            <option value="component_id">Component ID</option>
                                            <option value="motherboard_hotspot">Motherboard Hotspot</option>
                                            <option value="assembly_sequence">Assembly Sequence</option>
                                            <option value="drag_drop_build">Drag-and-Drop Build</option>
                                            <option value="troubleshooting">Troubleshooting</option>
                                            <option value="preventive_maintenance">Maintenance</option>
                                            <option value="repair_report">Repair Report</option>
                                            <option value="bios_config">UEFI BIOS Utility</option>
                                            <option value="cable_pinout">PSU & Front Cables</option>
                                            <option value="beep_code_diagnostic">POST Diagnostic Beeps</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Pass Score (%)</label>
                                        <input
                                            type="number"
                                            value={data.passing_score}
                                            onChange={(e) => setData('passing_score', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                            min="0"
                                            max="100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Time (Mins)</label>
                                        <input
                                            type="number"
                                            value={data.time_limit}
                                            onChange={(e) => setData('time_limit', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                                >
                                    {processing ? 'Initializing...' : 'Initialize Simulator'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Filter & View Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
                        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                            <Link
                                href={route('instructor.labs.index', { tab: 'active', search: searchTerm || undefined })}
                                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                                    tab === 'active'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Active Labs ({counts.active || 0})
                            </Link>
                            <Link
                                href={route('instructor.labs.index', { tab: 'trash', search: searchTerm || undefined })}
                                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                                    tab === 'trash'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>🗑️ Trash</span>
                                <span>({counts.trash || 0})</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search lab title or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 w-56"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Grid vs Table Layout Switcher */}
                            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setLayoutMode('grid')}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                                        layoutMode === 'grid'
                                            ? 'bg-slate-800 text-blue-400 shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Card Grid Layout"
                                >
                                    <span>🔲</span>
                                    <span className="hidden sm:inline">Cards</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLayoutMode('table')}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                                        layoutMode === 'table'
                                            ? 'bg-slate-800 text-blue-400 shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Compact Table Layout"
                                >
                                    <span>📋</span>
                                    <span className="hidden sm:inline">Table</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {labs.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400">
                            <span className="text-4xl block mb-3">🔬</span>
                            <p className="font-bold text-base text-slate-200">
                                {tab === 'trash' ? 'Trash bin is empty.' : 'No simulation labs found.'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {tab === 'trash' ? 'Deleted simulation labs will appear here for restoration.' : 'Create a new simulator using the button above to begin.'}
                            </p>
                        </div>
                    ) : layoutMode === 'grid' ? (
                        /* ================= DARK THEME GRID CARD LAYOUT ================= */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {labs.map((l) => {
                                const typeMeta = getLabTypeMeta(l.type);
                                const expInfo = getExpirationStatus(l);

                                return (
                                    <div
                                        key={l.id}
                                        className="rounded-2xl border border-slate-800 hover:border-blue-500/60 bg-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        {/* Card Top / Header */}
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border ${typeMeta.bg}`}>
                                                    <span>{typeMeta.icon}</span>
                                                    <span>{typeMeta.label}</span>
                                                </span>

                                                {tab === 'trash' ? (
                                                    <span className="rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                                                        Trashed
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(l)}
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition border ${
                                                            l.is_active
                                                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                        }`}
                                                        title="Click to toggle lab activation"
                                                    >
                                                        <span>{l.is_active ? '🟢 ACTIVE' : '⚪ INACTIVE'}</span>
                                                    </button>
                                                )}
                                            </div>

                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                                                {l.module?.course?.title} &raquo; {l.module?.title}
                                            </span>

                                            <h4 className="text-base font-black text-white leading-snug group-hover:text-blue-400 transition">
                                                {l.title}
                                            </h4>

                                            <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed font-normal">
                                                {l.description || 'Interactive hands-on simulation workstation with automated step verification.'}
                                            </p>
                                        </div>

                                        {/* Card Bottom / Badges & Actions */}
                                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3.5">
                                            <div className="flex items-center justify-between text-xs text-slate-300">
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                                                    <span>🎯</span> {l.passing_score}% Pass Score
                                                </span>
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                                                    <span>⏱️</span> {l.time_limit ? `${l.time_limit} Mins` : 'Unlimited'}
                                                </span>
                                            </div>

                                            {tab !== 'trash' && (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1 border ${expInfo.color}`}>
                                                        <span>{expInfo.text}</span>
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => openExpirationModal(l)}
                                                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline shrink-0"
                                                    >
                                                        ⚙️ Set Window
                                                    </button>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 pt-1">
                                                {tab === 'trash' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRestore(l.id)}
                                                            className="w-1/2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center"
                                                        >
                                                            ♻️ Restore Lab
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleForceDelete(l.id, l.title)}
                                                            className="w-1/2 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center"
                                                        >
                                                            ❌ Wipe
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={route('instructor.labs.edit', l.id)}
                                                            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center flex items-center justify-center gap-1.5"
                                                        >
                                                            <span>⚙️</span>
                                                            <span>Configure Simulator</span>
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleSoftDelete(l)}
                                                            className="p-2.5 rounded-xl border border-rose-800/60 bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 transition shrink-0"
                                                            title="Move to Trash"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ================= COMPACT TABLE LAYOUT ================= */
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Lab Title & Module</th>
                                            <th className="px-6 py-3.5">Type</th>
                                            <th className="px-6 py-3.5">Lifecycle Status</th>
                                            <th className="px-6 py-3.5">Expiration Window</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {labs.map((l) => {
                                            const typeMeta = getLabTypeMeta(l.type);
                                            const expInfo = getExpirationStatus(l);
                                            return (
                                                <tr key={l.id} className="hover:bg-slate-800/50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white">
                                                            {l.title}
                                                        </div>
                                                        <div className="text-[10px] text-blue-400 font-medium">
                                                            {l.module?.title} &bull; <span className="text-slate-400">{l.module?.course?.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border ${typeMeta.bg}`}>
                                                            <span>{typeMeta.icon}</span>
                                                            <span>{typeMeta.label}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {tab === 'trash' ? (
                                                            <span className="inline-flex rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                                                Trashed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleStatus(l)}
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition border ${
                                                                    l.is_active
                                                                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                                                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                                }`}
                                                            >
                                                                <span>{l.is_active ? '🟢 Active' : '⚪ Inactive'}</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {tab === 'trash' ? (
                                                            <span className="text-[11px] text-slate-500">N/A</span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => openExpirationModal(l)}
                                                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition hover:opacity-80 border ${expInfo.color}`}
                                                            >
                                                                <span>{expInfo.text}</span>
                                                                <span className="text-[9px] underline">⚙️ Set</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {tab === 'trash' ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRestore(l.id)}
                                                                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 font-bold text-xs shadow-sm transition"
                                                                    >
                                                                        ♻️ Restore
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleForceDelete(l.id, l.title)}
                                                                        className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 font-bold text-xs shadow-sm transition"
                                                                    >
                                                                        ❌ Wipe
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Link
                                                                        href={route('instructor.labs.edit', l.id)}
                                                                        className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 font-bold text-xs text-white shadow-sm transition"
                                                                    >
                                                                        Configure
                                                                    </Link>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSoftDelete(l)}
                                                                        className="rounded-lg border border-rose-800/60 bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 px-2.5 py-1.5 font-bold text-xs transition"
                                                                        title="Move to Trash"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Set Expiration Window Modal */}
            {expiringLab && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white">
                                Set Expiration: {expiringLab.title}
                            </h3>
                            <button onClick={() => setExpiringLab(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Quick Access Duration Presets
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSetDurationPreset(7)}
                                        className="rounded-xl border border-blue-800/80 bg-blue-950/60 py-2 font-bold text-blue-300 hover:bg-blue-900 transition"
                                    >
                                        ⏱️ 7 Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetDurationPreset(14)}
                                        className="rounded-xl border border-indigo-800/80 bg-indigo-950/60 py-2 font-bold text-indigo-300 hover:bg-indigo-900 transition"
                                    >
                                        ⏱️ 14 Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetDurationPreset(30)}
                                        className="rounded-xl border border-purple-800/80 bg-purple-950/60 py-2 font-bold text-purple-300 hover:bg-purple-900 transition"
                                    >
                                        ⏱️ 30 Days
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleExpirationSubmit} className="space-y-3 pt-2 border-t border-slate-800">
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Or Custom Expiration Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={expirationForm.data.expires_at}
                                        onChange={e => expirationForm.setData('expires_at', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClearExpiration}
                                        className="rounded-xl text-xs font-bold text-rose-400 hover:underline"
                                    >
                                        Clear Expiration (Never Expire)
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setExpiringLab(null)}
                                            className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={expirationForm.processing}
                                            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md"
                                        >
                                            Save Expiration
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
