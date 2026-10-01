import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Trainees({ trainees, tab = 'active', search: initSearch = '', counts = {} }) {
    const traineeData = trainees.data || trainees || [];
    const links = trainees.links || [];

    const [activeTab, setActiveTab] = useState('none'); // 'none', 'single', 'bulk_csv', 'bulk_grid'
    const [searchTerm, setSearchTerm] = useState(initSearch || '');

    // Modals state
    const [editingTrainee, setEditingTrainee] = useState(null);
    const [passwordResetTrainee, setPasswordResetTrainee] = useState(null);

    // Edit form
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        is_active: true,
    });

    // Password reset form
    const resetPasswordForm = useForm({
        password: '',
    });

    // Single registration form
    const singleForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        is_active: true,
    });

    // Bulk dynamic grid form
    const [gridRows, setGridRows] = useState([
        { name: '', email: '', phone: '', password: 'Password@123' },
        { name: '', email: '', phone: '', password: 'Password@123' },
        { name: '', email: '', phone: '', password: 'Password@123' },
    ]);
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

    const [csvText, setCsvText] = useState('');
    const [parsedRows, setParsedRows] = useState([]);
    const [parseError, setParseError] = useState('');

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        router.get(route('instructor.trainees.index'), {
            tab: tab,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        singleForm.post(route('instructor.trainees.store'), {
            onSuccess: () => {
                singleForm.reset();
                setActiveTab('none');
            },
        });
    };

    const openEditModal = (t) => {
        setEditingTrainee(t);
        editForm.setData({
            name: t.name,
            email: t.email,
            phone: t.phone || '',
            is_active: Boolean(t.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingTrainee) return;

        editForm.put(route('instructor.trainees.update', editingTrainee.id), {
            onSuccess: () => setEditingTrainee(null),
        });
    };

    const openPasswordResetModal = (t) => {
        setPasswordResetTrainee(t);
        resetPasswordForm.reset();
    };

    const handlePasswordResetSubmit = (e) => {
        e.preventDefault();
        if (!passwordResetTrainee) return;

        resetPasswordForm.post(route('instructor.trainees.reset-password', passwordResetTrainee.id), {
            onSuccess: () => setPasswordResetTrainee(null),
        });
    };

    const handleToggleStatus = (t) => {
        router.post(route('instructor.trainees.toggle-status', t.id), {}, {
            preserveScroll: true,
        });
    };

    const handleSoftDelete = (t) => {
        if (!confirm(`Are you sure you want to move ${t.name} to Trash?`)) return;
        router.delete(route('instructor.trainees.destroy', t.id), {
            preserveScroll: true,
        });
    };

    const handleRestore = (id) => {
        router.post(route('instructor.trainees.restore', id), {}, {
            preserveScroll: true,
        });
    };

    const handleForceDelete = (id, name) => {
        if (!confirm(`PERMANENT DELETE: Are you sure you want to permanently delete ${name}? This cannot be undone.`)) return;
        router.delete(route('instructor.trainees.force-delete', id), {
            preserveScroll: true,
        });
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Full Name,Email Address,Phone Number,Password\nJohn Doe,john@example.com,+2348000000000,Password@123\nJane Smith,jane@example.com,,Password@123";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "trainee_import_template.csv");
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
                        name: name || 'Trainee ' + (results.length + 1),
                        email: email,
                        phone: phone || '',
                        password: password || 'Password@123'
                    });
                }
            }
        }

        if (results.length === 0 && lines.length > 0) {
            setParseError('No valid rows found. Ensure each line has at least Name and Email (e.g. John Doe, john@example.com)');
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

        setIsSubmittingBulk(true);
        router.post(route('instructor.trainees.bulk'), { trainees: parsedRows }, {
            onFinish: () => setIsSubmittingBulk(false),
            onSuccess: () => {
                setCsvText('');
                setParsedRows([]);
                setActiveTab('none');
            }
        });
    };

    const handleAddGridRow = () => {
        setGridRows([...gridRows, { name: '', email: '', phone: '', password: 'Password@123' }]);
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
        router.post(route('instructor.trainees.bulk'), { trainees: validRows }, {
            onFinish: () => setIsSubmittingBulk(false),
            onSuccess: () => {
                setGridRows([
                    { name: '', email: '', phone: '', password: 'Password@123' },
                    { name: '', email: '', phone: '', password: 'Password@123' },
                ]);
                setActiveTab('none');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            👥 Trainee Management & Directory
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Manage student accounts, soft deletes, account suspensions, and cohort bulk registration.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTab(activeTab === 'bulk_csv' ? 'none' : 'bulk_csv')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'bulk_csv'
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            }`}
                        >
                            📁 CSV Bulk Import
                        </button>
                        <button
                            onClick={() => setActiveTab(activeTab === 'bulk_grid' ? 'none' : 'bulk_grid')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'bulk_grid'
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                            }`}
                        >
                            ⚡ Quick Batch Entry
                        </button>
                        <button
                            onClick={() => setActiveTab(activeTab === 'single' ? 'none' : 'single')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                activeTab === 'single'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            }`}
                        >
                            + Single Trainee
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Trainees Directory" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Single Registration Drawer */}
                    {activeTab === 'single' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <h3 className="text-base font-bold text-white">
                                    Register Single Trainee
                                </h3>
                                <button
                                    onClick={() => setActiveTab('none')}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    ✕ Close
                                </button>
                            </div>
                            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={singleForm.data.name}
                                        onChange={(e) => singleForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        placeholder="e.g. Samuel K. Jackson"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={singleForm.data.email}
                                            onChange={(e) => singleForm.setData('email', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="samuel@school.local"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Phone (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={singleForm.data.phone}
                                            onChange={(e) => singleForm.setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Temporary Password
                                    </label>
                                    <input
                                        type="password"
                                        value={singleForm.data.password}
                                        onChange={(e) => singleForm.setData('password', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={singleForm.processing}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                                >
                                    {singleForm.processing ? 'Registering...' : 'Register Trainee & Auto-Assign Labs'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* CSV Bulk Drawer */}
                    {activeTab === 'bulk_csv' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-3xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Bulk Import Trainees via CSV
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Upload a CSV spreadsheet or paste text to batch register students.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                                    >
                                        📥 Template (.CSV)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('none')}
                                        className="text-xs text-slate-400 hover:text-white p-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleBulkSubmitCsv} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-950">
                                        <span className="text-2xl mb-1">📄</span>
                                        <span className="text-xs font-bold text-slate-200">Choose CSV File</span>
                                        <span className="text-[10px] text-slate-400 mb-3">Columns: Full Name, Email, Phone, Password</span>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv,text/plain"
                                            onChange={handleCsvFileUpload}
                                            className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Or Paste CSV Data
                                        </label>
                                        <textarea
                                            value={csvText}
                                            onChange={(e) => {
                                                setCsvText(e.target.value);
                                                parseCsvContent(e.target.value);
                                            }}
                                            rows="4"
                                            placeholder="Full Name, Email, Phone, Password&#10;Alice Smith, alice@school.local, +234..., Password@123"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {parseError && (
                                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                                        {parseError}
                                    </div>
                                )}

                                {parsedRows.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                                            <span>Parsed Preview ({parsedRows.length} trainees ready to register):</span>
                                            <span className="text-emerald-400 font-semibold">✓ Format Verified</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-950 text-slate-400">
                                                    <tr>
                                                        <th className="px-3 py-2">#</th>
                                                        <th className="px-3 py-2">Full Name</th>
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
                                        onClick={() => {
                                            setCsvText('');
                                            setParsedRows([]);
                                            setActiveTab('none');
                                        }}
                                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingBulk || parsedRows.length === 0}
                                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-md"
                                    >
                                        {isSubmittingBulk ? 'Importing Trainees...' : `Import & Auto-Assign Labs (${parsedRows.length})`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Quick Batch Entry Grid */}
                    {activeTab === 'bulk_grid' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Quick Batch Trainee Entry Grid
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Quickly key in multiple trainees. Passwords default to <code className="text-indigo-400 font-mono">Password@123</code>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('none')}
                                    className="text-xs text-slate-400 hover:text-white p-1"
                                >
                                    ✕
                                </button>
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
                                                className="w-1/3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={row.email}
                                                onChange={(e) => handleGridRowChange(idx, 'email', e.target.value)}
                                                className="w-1/3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Password (Default: Password@123)"
                                                value={row.password}
                                                onChange={(e) => handleGridRowChange(idx, 'password', e.target.value)}
                                                className="w-1/4 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                                            />
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
                                            onClick={() => setActiveTab('none')}
                                            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingBulk}
                                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-md"
                                        >
                                            {isSubmittingBulk ? 'Registering...' : 'Save All & Auto-Assign Labs'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Trainee Directory Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        {/* Header Tabs and Search Bar */}
                        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                                <Link
                                    href={route('instructor.trainees.index', { tab: 'active', search: searchTerm || undefined })}
                                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                                        tab === 'active'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Active Trainees ({counts.active || 0})
                                </Link>
                                <Link
                                    href={route('instructor.trainees.index', { tab: 'trash', search: searchTerm || undefined })}
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

                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 w-64"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {traineeData.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="text-3xl block mb-2">👥</span>
                                <p className="font-semibold text-sm text-slate-300">
                                    {tab === 'trash' ? 'Trash bin is empty.' : 'No trainee accounts found.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Trainee</th>
                                            <th className="px-6 py-3.5">Contact</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Labs Progress</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {traineeData.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">
                                                        {t.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        ID: #{t.id} &bull; Joined: {new Date(t.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-[11px] text-slate-200">
                                                        {t.email}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {t.phone || 'No phone recorded'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {tab === 'trash' ? (
                                                        <span className="inline-flex rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                                            Trashed
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(t)}
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition border ${
                                                                t.is_active
                                                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                                                                    : 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900'
                                                            }`}
                                                            title="Click to toggle account active/suspended"
                                                        >
                                                            <span>{t.is_active ? '🟢 Active' : '⛔ Suspended'}</span>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[11px] font-semibold text-slate-200 block">
                                                        {t.attempts_count || 0} Submissions
                                                    </span>
                                                    <span className="text-[10px] text-blue-400">
                                                        {t.assignments_count || 0} Assigned Labs
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        {tab === 'trash' ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRestore(t.id)}
                                                                    className="rounded-xl border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ♻️ Restore
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleForceDelete(t.id, t.name)}
                                                                    className="rounded-xl border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ❌ Wipe
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(t)}
                                                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openPasswordResetModal(t)}
                                                                    className="rounded-xl border border-indigo-800/80 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 px-2.5 py-1 font-bold text-xs transition"
                                                                >
                                                                    🔑 Reset
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSoftDelete(t)}
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
                                    Showing {trainees.from} to {trainees.to} of {trainees.total} trainees
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

            {/* Edit Trainee Modal */}
            {editingTrainee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white">Edit Trainee Profile</h3>
                            <button onClick={() => setEditingTrainee(null)} className="text-slate-400 hover:text-white">✕</button>
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

                            <div>
                                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={editForm.data.phone}
                                    onChange={e => editForm.setData('phone', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="edit_active"
                                    checked={editForm.data.is_active}
                                    onChange={e => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="edit_active" className="text-xs font-bold text-slate-300">
                                    Account is Active (Uncheck to Suspend)
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingTrainee(null)}
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
            {passwordResetTrainee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white">
                                Reset Password for {passwordResetTrainee.name}
                            </h3>
                            <button onClick={() => setPasswordResetTrainee(null)} className="text-slate-400 hover:text-white">✕</button>
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
                                    onClick={() => setPasswordResetTrainee(null)}
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
