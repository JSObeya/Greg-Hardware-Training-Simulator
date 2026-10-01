import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function Users({ users, roles = [], tab = 'active', filters = {}, counts = {} }) {
    const userData = users.data || users || [];
    const links = users.links || [];

    const [activeDrawer, setActiveDrawer] = useState('none'); // 'none', 'single', 'bulk_csv', 'bulk_grid'
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    // Modals
    const [editingUser, setEditingUser] = useState(null);
    const [passwordResetUser, setPasswordResetUser] = useState(null);

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role_id: roles[0]?.id || '',
        is_active: true,
    });

    const resetPasswordForm = useForm({
        password: '',
    });

    const singleForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role_id: roles[0]?.id || '',
        is_active: true,
    });

    const [defaultRoleForBulk, setDefaultRoleForBulk] = useState(roles.find(r => r.name === 'trainee')?.id || roles[0]?.id || '');
    const [gridRows, setGridRows] = useState([
        { name: '', email: '', phone: '', password: 'Password@123', role_id: roles.find(r => r.name === 'trainee')?.id || roles[0]?.id || '' },
        { name: '', email: '', phone: '', password: 'Password@123', role_id: roles.find(r => r.name === 'trainee')?.id || roles[0]?.id || '' },
        { name: '', email: '', phone: '', password: 'Password@123', role_id: roles.find(r => r.name === 'trainee')?.id || roles[0]?.id || '' },
    ]);
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

    const [csvText, setCsvText] = useState('');
    const [parsedRows, setParsedRows] = useState([]);
    const [parseError, setParseError] = useState('');

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(route('admin.users.index'), {
            tab: tab,
            search: searchTerm || undefined,
            role: roleFilter || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        singleForm.post(route('admin.users.store'), {
            onSuccess: () => {
                singleForm.reset();
                setActiveDrawer('none');
            }
        });
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        editForm.setData({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role_id: u.role_id || roles[0]?.id,
            is_active: Boolean(u.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(route('admin.users.update', editingUser.id), {
            onSuccess: () => setEditingUser(null),
        });
    };

    const openPasswordResetModal = (u) => {
        setPasswordResetUser(u);
        resetPasswordForm.reset();
    };

    const handlePasswordResetSubmit = (e) => {
        e.preventDefault();
        if (!passwordResetUser) return;

        resetPasswordForm.post(route('admin.users.reset-password', passwordResetUser.id), {
            onSuccess: () => setPasswordResetUser(null),
        });
    };

    const handleToggleStatus = (u) => {
        router.post(route('admin.users.toggle-status', u.id), {}, {
            preserveScroll: true,
        });
    };

    const handleSoftDelete = (u) => {
        if (!confirm(`Are you sure you want to move ${u.name} to Trash?`)) return;
        router.delete(route('admin.users.destroy', u.id), {
            preserveScroll: true,
        });
    };

    const handleRestore = (id) => {
        router.post(route('admin.users.restore', id), {}, {
            preserveScroll: true,
        });
    };

    const handleForceDelete = (id, name) => {
        if (!confirm(`PERMANENT DELETE: Are you sure you want to permanently wipe ${name}? This cannot be undone.`)) return;
        router.delete(route('admin.users.force-delete', id), {
            preserveScroll: true,
        });
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone,Password\nJohn Doe,john@example.com,+2348000000000,Password@123\nJane Smith,jane@example.com,,Password@123";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_bulk_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCsvContent = (text) => {
        setParseError('');
        if (!text.trim()) {
            setParsedRows([]);
            return;
        }

        const lines = text.trim().split(/\r?\n/);
        if (lines.length === 0) {
            setParsedRows([]);
            return;
        }

        const firstLine = lines[0].toLowerCase();
        const startIndex = (firstLine.includes('name') && firstLine.includes('email')) ? 1 : 0;

        const results = [];
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length >= 2) {
                const [name, email, phone, password] = cols;
                if (email && email.includes('@')) {
                    results.push({
                        name: name || 'User ' + (results.length + 1),
                        email: email,
                        phone: phone || '',
                        password: password || 'Password@123',
                        role_id: defaultRoleForBulk
                    });
                }
            }
        }

        if (results.length === 0 && lines.length > 0) {
            setParseError('No valid rows found. Please ensure each row contains at least Name and Email (e.g. John Doe, john@example.com)');
        }

        setParsedRows(results);
    };

    const handleCsvFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            setCsvText(content);
            parseCsvContent(content);
        };
        reader.readAsText(file);
    };

    const handleBulkSubmitCsv = (e) => {
        e.preventDefault();
        if (parsedRows.length === 0) return;

        const finalRows = parsedRows.map(r => ({
            ...r,
            role_id: r.role_id || defaultRoleForBulk
        }));

        setIsSubmittingBulk(true);
        router.post(route('admin.users.bulk'), { users: finalRows }, {
            onFinish: () => setIsSubmittingBulk(false),
            onSuccess: () => {
                setCsvText('');
                setParsedRows([]);
                setActiveDrawer('none');
            }
        });
    };

    const handleAddGridRow = () => {
        setGridRows([...gridRows, { name: '', email: '', phone: '', password: 'Password@123', role_id: defaultRoleForBulk }]);
    };

    const handleRemoveGridRow = (index) => {
        if (gridRows.length <= 1) return;
        setGridRows(gridRows.filter((_, i) => i !== index));
    };

    const handleGridRowChange = (index, field, value) => {
        const updated = [...gridRows];
        updated[index][field] = value;
        setGridRows(updated);
    };

    const handleBulkSubmitGrid = (e) => {
        e.preventDefault();
        const validRows = gridRows.filter(r => r.name.trim() && r.email.trim() && r.email.includes('@'));
        if (validRows.length === 0) {
            alert('Please fill in at least one valid row with name and email.');
            return;
        }

        setIsSubmittingBulk(true);
        router.post(route('admin.users.bulk'), { users: validRows }, {
            onFinish: () => setIsSubmittingBulk(false),
            onSuccess: () => {
                setGridRows([
                    { name: '', email: '', phone: '', password: 'Password@123', role_id: defaultRoleForBulk },
                    { name: '', email: '', phone: '', password: 'Password@123', role_id: defaultRoleForBulk },
                ]);
                setActiveDrawer('none');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            👥 User Accounts & Access Control
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Comprehensive user administration: manage roles, suspensions, password resets, and soft deletes.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveDrawer(activeDrawer === 'bulk_csv' ? 'none' : 'bulk_csv')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeDrawer === 'bulk_csv'
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            }`}
                        >
                            📁 CSV Bulk Import
                        </button>
                        <button
                            onClick={() => setActiveDrawer(activeDrawer === 'bulk_grid' ? 'none' : 'bulk_grid')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeDrawer === 'bulk_grid'
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                            }`}
                        >
                            ⚡ Quick Batch Entry
                        </button>
                        <button
                            onClick={() => setActiveDrawer(activeDrawer === 'single' ? 'none' : 'single')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                activeDrawer === 'single'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            }`}
                        >
                            + Single User
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="User Accounts - Admin Control" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Form Drawers */}
                    {activeDrawer === 'single' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-2xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <h3 className="text-base font-bold text-white">
                                    Register New User Account
                                </h3>
                                <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
                            </div>
                            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={singleForm.data.name}
                                            onChange={e => singleForm.setData('name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="e.g. Dr. Arthur Greg"
                                            required
                                        />
                                        <InputError message={singleForm.errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={singleForm.data.email}
                                            onChange={e => singleForm.setData('email', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="arthur@school.edu"
                                            required
                                        />
                                        <InputError message={singleForm.errors.email} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={singleForm.data.phone}
                                            onChange={e => singleForm.setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="+234..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={singleForm.data.password}
                                            onChange={e => singleForm.setData('password', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <InputError message={singleForm.errors.password} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Access Role</label>
                                        <select
                                            value={singleForm.data.role_id}
                                            onChange={e => singleForm.setData('role_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500"
                                            required
                                        >
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={singleForm.processing}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                                >
                                    {singleForm.processing ? 'Registering...' : 'Register User Account'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* CSV Bulk Drawer */}
                    {activeDrawer === 'bulk_csv' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-3xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">Bulk Import Users from CSV</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Upload a CSV file or paste rows to batch import user accounts.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                                    >
                                        📥 Template (.CSV)
                                    </button>
                                    <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
                                </div>
                            </div>

                            <form onSubmit={handleBulkSubmitCsv} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-950">
                                        <span className="text-2xl mb-1">📄</span>
                                        <span className="text-xs font-bold text-slate-200">Choose CSV File</span>
                                        <span className="text-[10px] text-slate-400 mb-3">Columns: Name, Email, Phone, Password</span>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv,text/plain"
                                            onChange={handleCsvFileUpload}
                                            className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or Paste CSV Text</label>
                                        <textarea
                                            value={csvText}
                                            onChange={e => { setCsvText(e.target.value); parseCsvContent(e.target.value); }}
                                            rows="4"
                                            placeholder="Name, Email, Phone, Password&#10;Alice Smith, alice@school.edu, +234..., Password@123"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <label className="font-bold text-slate-300 shrink-0">Default Role for Imported Users:</label>
                                    <select
                                        value={defaultRoleForBulk}
                                        onChange={e => setDefaultRoleForBulk(e.target.value)}
                                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                                    >
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                {parseError && (
                                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                                        {parseError}
                                    </div>
                                )}

                                {parsedRows.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                                            <span>Parsed Preview ({parsedRows.length} users ready):</span>
                                            <span className="text-emerald-400 font-semibold">✓ Verified</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-950 text-slate-400">
                                                    <tr>
                                                        <th className="px-3 py-2">#</th>
                                                        <th className="px-3 py-2">Name</th>
                                                        <th className="px-3 py-2">Email</th>
                                                        <th className="px-3 py-2">Password</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                                    {parsedRows.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-1.5 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                                                            <td className="px-3 py-1.5 font-medium">{row.name}</td>
                                                            <td className="px-3 py-1.5 font-mono text-[11px]">{row.email}</td>
                                                            <td className="px-3 py-1.5 font-mono text-[11px] text-slate-400">{row.password ? '••••••••' : 'Password@123'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setCsvText(''); setParsedRows([]); setActiveDrawer('none'); }}
                                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingBulk || parsedRows.length === 0}
                                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-md"
                                    >
                                        {isSubmittingBulk ? 'Importing...' : `Import Users (${parsedRows.length})`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Quick Batch Entry Grid */}
                    {activeDrawer === 'bulk_grid' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Quick Batch User Entry Grid
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Quickly key in multiple users. Passwords default to <code className="text-indigo-400 font-mono">Password@123</code>.
                                    </p>
                                </div>
                                <button onClick={() => setActiveDrawer('none')} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
                            </div>

                            <form onSubmit={handleBulkSubmitGrid} className="space-y-4">
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {gridRows.map((row, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-400 w-5 shrink-0 text-right">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={row.name}
                                                onChange={(e) => handleGridRowChange(idx, 'name', e.target.value)}
                                                className="w-1/4 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={row.email}
                                                onChange={(e) => handleGridRowChange(idx, 'email', e.target.value)}
                                                className="w-1/4 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone (Opt)"
                                                value={row.phone}
                                                onChange={(e) => handleGridRowChange(idx, 'phone', e.target.value)}
                                                className="w-1/6 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
                                            />
                                            <select
                                                value={row.role_id}
                                                onChange={(e) => handleGridRowChange(idx, 'role_id', e.target.value)}
                                                className="w-1/6 rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white"
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGridRow(idx)}
                                                disabled={gridRows.length <= 1}
                                                className="p-2 text-slate-400 hover:text-rose-400 disabled:opacity-20 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleAddGridRow}
                                        className="rounded-xl border border-indigo-800 bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900 transition"
                                    >
                                        + Add Another Row
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDrawer('none')}
                                            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingBulk}
                                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-md"
                                        >
                                            {isSubmittingBulk ? 'Registering...' : 'Save All Users'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Users Directory Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        {/* Header Controls */}
                        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                                <Link
                                    href={route('admin.users.index', { tab: 'active', search: searchTerm || undefined, role: roleFilter || undefined })}
                                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                                        tab === 'active'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Active Directory ({counts.active || 0})
                                </Link>
                                <Link
                                    href={route('admin.users.index', { tab: 'trash', search: searchTerm || undefined, role: roleFilter || undefined })}
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

                            <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2">
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">All Access Roles</option>
                                    <option value="admin">Administrators</option>
                                    <option value="instructor">Instructors</option>
                                    <option value="trainee">Trainees</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Search name, email, phone..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 w-56"
                                />

                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
                                >
                                    Filter
                                </button>
                            </form>
                        </div>

                        {userData.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="text-3xl block mb-2">👥</span>
                                <p className="font-semibold text-sm text-slate-300">
                                    {tab === 'trash' ? 'Trash bin is empty.' : 'No user accounts found matching your filters.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">User Details</th>
                                            <th className="px-6 py-3.5">Role</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Registration Date</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {userData.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">
                                                        {u.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {u.email} {u.phone ? `• ${u.phone}` : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                        u.role?.name === 'admin' 
                                                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                                                            : u.role?.name === 'instructor'
                                                            ? 'bg-sky-950/80 text-sky-300 border-sky-800/80'
                                                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                                                    }`}>
                                                        {u.role?.name || 'Trainee'}
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
                                                            onClick={() => handleToggleStatus(u)}
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition border ${
                                                                u.is_active
                                                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                                                                    : 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900'
                                                            }`}
                                                            title="Click to toggle active/suspended status"
                                                        >
                                                            <span>{u.is_active ? '🟢 Active' : '⛔ Suspended'}</span>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        {tab === 'trash' ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRestore(u.id)}
                                                                    className="rounded-xl border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ♻️ Restore
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleForceDelete(u.id, u.name)}
                                                                    className="rounded-xl border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ❌ Wipe
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(u)}
                                                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openPasswordResetModal(u)}
                                                                    className="rounded-xl border border-indigo-800/80 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    🔑 Reset
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSoftDelete(u)}
                                                                    className="rounded-xl border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900 px-2.5 py-1 font-bold text-xs transition"
                                                                    title="Move to Trash"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {links.length > 3 && (
                            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
                                <div className="text-slate-400">
                                    Showing {users.from} to {users.to} of {users.total} users
                                </div>
                                <div className="flex gap-1.5">
                                    {links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                                                link.active
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white">Edit User Profile</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={e => editForm.setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.data.phone}
                                        onChange={e => editForm.setData('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Access Role</label>
                                    <select
                                        value={editForm.data.role_id}
                                        onChange={e => editForm.setData('role_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500"
                                    >
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="admin_edit_active"
                                    checked={editForm.data.is_active}
                                    onChange={e => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="admin_edit_active" className="text-xs font-bold text-slate-300">
                                    Account is Active (Uncheck to Suspend)
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="w-1/2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {passwordResetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white">
                                Reset Password for {passwordResetUser.name}
                            </h3>
                            <button onClick={() => setPasswordResetUser(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handlePasswordResetSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={resetPasswordForm.data.password}
                                    onChange={e => resetPasswordForm.setData('password', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter new password (min 8 chars)"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordResetUser(null)}
                                    className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPasswordForm.processing}
                                    className="w-1/2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
