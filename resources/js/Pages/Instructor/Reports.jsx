import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Reports({
    attempts = {},
    kpis = {},
    filters = {},
    filterOptions = {},
    trashCount = 0,
    activeCount = 0
}) {
    // Determine paginated data vs raw array
    const attemptItems = useMemo(() => {
        if (Array.isArray(attempts)) return attempts;
        return attempts.data || [];
    }, [attempts]);

    const paginationMeta = useMemo(() => {
        if (Array.isArray(attempts)) {
            return {
                current_page: 1,
                last_page: 1,
                total: attempts.length,
                from: 1,
                to: attempts.length,
                links: [],
            };
        }
        return {
            current_page: attempts.current_page || 1,
            last_page: attempts.last_page || 1,
            total: attempts.total || 0,
            from: attempts.from || 0,
            to: attempts.to || 0,
            links: attempts.links || [],
        };
    }, [attempts]);

    // Active Tab: 'active' or 'trashed'
    const isTrash = filters.trash === 'trashed';

    // Filters state
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || 'all');
    const [selectedLab, setSelectedLab] = useState(filters.lab_id || 'all');
    const [selectedCohort, setSelectedCohort] = useState(filters.cohort || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '25');

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // View Mode: 'table' or 'grouped'
    const [viewMode, setViewMode] = useState('table');
    const [groupByKey, setGroupByKey] = useState('trainee'); // 'trainee', 'lab', 'cohort', 'module'
    const [collapsedGroups, setCollapsedGroups] = useState({});

    // Export Modal State
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf', 'docx', 'csv', 'print'
    const [exportGroupBy, setExportGroupBy] = useState('trainee');
    const [exportScope, setExportScope] = useState('filtered'); // 'selected' or 'filtered'

    // Confirmation Modal for Deletion
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        action: null, // 'delete_single', 'delete_bulk', 'force_single', 'force_bulk', 'restore_single', 'restore_bulk'
        targetId: null,
        title: '',
        message: '',
    });

    // Checkbox toggles
    const isAllPageSelected = attemptItems.length > 0 && attemptItems.every((item) => selectedIds.includes(item.id));
    const isSomePageSelected = attemptItems.some((item) => selectedIds.includes(item.id)) && !isAllPageSelected;

    const handleToggleSelectAllPage = () => {
        if (isAllPageSelected) {
            // Deselect all on current page
            const pageIds = attemptItems.map((item) => item.id);
            setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
        } else {
            // Select all on current page
            const newIds = new Set([...selectedIds, ...attemptItems.map((item) => item.id)]);
            setSelectedIds(Array.from(newIds));
        }
    };

    const handleToggleRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    // Grouping computation for 'grouped' view mode
    const groupedItems = useMemo(() => {
        const groups = {};
        attemptItems.forEach((att) => {
            let key = 'general';
            let title = 'All Submissions';
            let subtitle = '';

            if (groupByKey === 'trainee') {
                key = String(att.trainee_id || att.trainee_email || 'unknown');
                title = att.trainee_name || 'Unknown Trainee';
                subtitle = `${att.cohort || 'Standard'} • ${att.trainee_email || ''}`;
            } else if (groupByKey === 'lab') {
                key = String(att.lab_id || att.lab_title || 'unknown');
                title = att.lab_title || 'Lab Simulator';
                subtitle = `${att.course_title || 'Course'} • ${att.is_practice ? 'Practice Mode' : 'Graded Exam'}`;
            } else if (groupByKey === 'cohort') {
                key = String(att.cohort || 'Standard');
                title = `Cohort: ${att.cohort || 'Standard'}`;
                subtitle = `Academic Batch`;
            } else if (groupByKey === 'module') {
                key = String(att.module_title || 'general');
                title = att.module_title || 'Module';
                subtitle = att.course_title || 'Course Curriculum';
            }

            if (!groups[key]) {
                groups[key] = {
                    key,
                    title,
                    subtitle,
                    items: [],
                };
            }
            groups[key].items.push(att);
        });

        return Object.values(groups);
    }, [attemptItems, groupByKey]);

    // Handle filter submission
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
            trash: isTrash ? 'trashed' : undefined,
            per_page: perPage !== '25' ? perPage : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSwitchTab = (tab) => {
        setSelectedIds([]);
        router.get(route('instructor.reports.index'), {
            course_id: selectedCourse !== 'all' ? selectedCourse : undefined,
            lab_id: selectedLab !== 'all' ? selectedLab : undefined,
            cohort: selectedCohort !== 'all' ? selectedCohort : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            search: searchTerm || undefined,
            trash: tab === 'trashed' ? 'trashed' : undefined,
            per_page: perPage !== '25' ? perPage : undefined,
        }, {
            preserveState: false,
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
        setPerPage('25');
        setSelectedIds([]);
        router.get(route('instructor.reports.index'), {
            trash: isTrash ? 'trashed' : undefined,
        }, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    // Toggle group accordion
    const toggleGroupCollapse = (key) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelectAllInGroup = (items) => {
        const itemIds = items.map((i) => i.id);
        const allInGroupSelected = itemIds.every((id) => selectedIds.includes(id));
        if (allInGroupSelected) {
            setSelectedIds(selectedIds.filter((id) => !itemIds.includes(id)));
        } else {
            setSelectedIds(Array.from(new Set([...selectedIds, ...itemIds])));
        }
    };

    // Execute Export / Print
    const handleTriggerExport = () => {
        setShowExportModal(false);

        if (exportFormat === 'print') {
            window.print();
            return;
        }

        const params = new URLSearchParams();
        params.append('format', exportFormat);
        params.append('group_by', exportGroupBy);

        if (exportScope === 'selected' && selectedIds.length > 0) {
            params.append('attempt_ids', selectedIds.join(','));
        } else {
            if (selectedCourse !== 'all') params.append('course_id', selectedCourse);
            if (selectedLab !== 'all') params.append('lab_id', selectedLab);
            if (selectedCohort !== 'all') params.append('cohort', selectedCohort);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (searchTerm) params.append('search', searchTerm);
        }

        const exportUrl = `${route('instructor.reports.export-batch')}?${params.toString()}`;
        window.location.href = exportUrl;
    };

    // Delete and Restore Actions
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
        } else if (action === 'restore_single' && targetId) {
            router.post(route('instructor.reports.restore', targetId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== targetId));
                },
            });
        } else if (action === 'restore_bulk' && selectedIds.length > 0) {
            router.post(route('instructor.reports.bulk-restore'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                },
            });
        } else if (action === 'force_single' && targetId) {
            router.delete(route('instructor.reports.force-delete', targetId), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== targetId));
                },
            });
        } else if (action === 'force_bulk' && selectedIds.length > 0) {
            router.post(route('instructor.reports.bulk-force-delete'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                },
            });
        }
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/80 uppercase tracking-widest font-mono">
                                Institutional Gradebook &amp; Analytics
                            </span>
                            {isTrash && (
                                <span className="inline-flex rounded-md bg-rose-950/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800 uppercase tracking-widest">
                                    🗑️ Recycle Bin
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black leading-tight text-white mt-1">
                            Universal Multi-Lab Custom Report Builder &amp; Cohorts
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Tab Switcher: Active vs Trashed */}
                        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                            <button
                                type="button"
                                onClick={() => handleSwitchTab('active')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    !isTrash ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <span>📋 Active</span>
                                <span className="ml-1 rounded-full bg-slate-950/60 px-1.5 py-0.2 text-[10px]">
                                    {activeCount}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchTab('trashed')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    isTrash ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <span>🗑️ Trash</span>
                                {trashCount > 0 && (
                                    <span className="ml-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-200 px-1.5 py-0.2 text-[10px] font-bold">
                                        {trashCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Export & Print Hub Trigger */}
                        <button
                            type="button"
                            onClick={() => {
                                setExportScope(selectedIds.length > 0 ? 'selected' : 'filtered');
                                setShowExportModal(true);
                            }}
                            className="rounded-xl border border-emerald-600 bg-emerald-600/90 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-md flex items-center gap-1.5"
                        >
                            <span>📥 Export &amp; Print</span>
                            {selectedIds.length > 0 && (
                                <span className="rounded-full bg-emerald-950 px-1.5 py-0.5 text-[10px] font-mono">
                                    {selectedIds.length}
                                </span>
                            )}
                        </button>

                        {/* Direct Print Button */}
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
            <Head title="Universal Multi-Lab Custom Reports &amp; Cohorts" />

            <div className="py-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Printable Header (Visible only when printing) */}
                    <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-6 text-black">
                        <div className="text-xl font-bold tracking-tight">GREG &amp; CO. COMPUTER HARDWARE TRAINING ACADEMY</div>
                        <div className="text-sm font-semibold text-slate-700">Universal Multi-Lab Institutional Assessment Report</div>
                        <div className="text-xs text-slate-500 mt-1">Generated: {new Date().toLocaleString()} | Passing Threshold: 70% | Official Gradebook Record</div>
                    </div>

                    {/* Executive KPI Summary Cards (Hidden during printing if desired or styled neatly) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 print:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</div>
                            <div className="text-2xl font-black text-white mt-1 font-mono">{kpis.total_attempts || 0}</div>
                            <div className="text-[10px] text-blue-400 mt-1 font-semibold">{kpis.unique_trainees || 0} unique trainees</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Average</div>
                            <div className={`text-2xl font-black mt-1 font-mono ${
                                (kpis.avg_score || 0) >= 70 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {kpis.avg_score || 0}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Benchmark: 70%</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</div>
                            <div className={`text-2xl font-black mt-1 font-mono ${
                                (kpis.pass_rate || 0) >= 80 ? 'text-emerald-400' : (kpis.pass_rate || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                                {kpis.pass_rate || 0}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Of evaluated runs</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety &amp; ESD</div>
                            <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{kpis.avg_safety_score || 100}%</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Anti-static protocol</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Duration</div>
                            <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{kpis.avg_duration_minutes || 0} <span className="text-xs font-normal">min</span></div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Simulator time</div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Batches</div>
                            <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">{(filterOptions.cohorts || []).length}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Enrolled cohorts</div>
                        </div>
                    </div>

                    {/* Multi-Parameter Query Console (Hidden when printing) */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4 print:hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-2">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                <span>⚡ Filter &amp; Aggregation Query Bar</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">
                                Refine results by cohort, course curriculum, lab workstation, status, or date
                            </span>
                        </div>

                        <form onSubmit={handleApplyFilters} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                
                                {/* Cohort Filter */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
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
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
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
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
                                        Lab Station
                                    </label>
                                    <select
                                        value={selectedLab}
                                        onChange={(e) => setSelectedLab(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="all">All Labs</option>
                                        {(filterOptions.labs || []).map((lb) => (
                                            <option key={lb.id} value={lb.id}>{lb.display_title || lb.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Outcome Status */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
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
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
                                        From Date
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
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    />
                                </div>

                                {/* Trainee Search */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
                                        Search Trainee
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Rows Per Page */}
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px]">
                                        Page Size (Fast Load)
                                    </label>
                                    <select
                                        value={perPage}
                                        onChange={(e) => setPerPage(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                                    >
                                        <option value="15">15 per page (Ultra Fast)</option>
                                        <option value="25">25 per page (Recommended)</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                        <option value="all">View All (Heavy)</option>
                                    </select>
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
                                    Apply Query Filters
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* View Controls & Selection Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md print:hidden">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* View Mode Toggle: Table vs Grouped */}
                            <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <span>📑 Flat Table</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grouped')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        viewMode === 'grouped' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <span>📁 Grouped View</span>
                                </button>
                            </div>

                            {/* Grouping Key Selector (if in Grouped view) */}
                            {viewMode === 'grouped' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-bold">Group By:</span>
                                    <select
                                        value={groupByKey}
                                        onChange={(e) => setGroupByKey(e.target.value)}
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 font-semibold"
                                    >
                                        <option value="trainee">👤 Trainee / Student</option>
                                        <option value="lab">🔬 Lab Simulator Station</option>
                                        <option value="cohort">👥 Cohort Batch</option>
                                        <option value="module">📚 Course &amp; Module</option>
                                    </select>
                                </div>
                            )}

                            {/* Select All on Page / Deselect All */}
                            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleToggleSelectAllPage}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                                >
                                    {isAllPageSelected ? 'Deselect Page' : 'Select Page'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleDeselectAll}
                                        className="text-xs text-slate-400 hover:text-slate-200 font-medium"
                                    >
                                        (Clear all {selectedIds.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Selected Counter & Multi-Select Action Bar */}
                        {selectedIds.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 bg-blue-950/90 border border-blue-700/80 px-3.5 py-1.5 rounded-xl animate-fadeIn">
                                <span className="text-xs font-bold text-blue-200">
                                    🎯 {selectedIds.length} Selected
                                </span>

                                <div className="h-4 w-px bg-blue-700/80 mx-1"></div>

                                {/* Export Selected to Word */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExportScope('selected');
                                        setExportFormat('docx');
                                        handleTriggerExport();
                                    }}
                                    className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1"
                                    title="Export Selected to Word (.docx)"
                                >
                                    <span>📘 Word</span>
                                </button>

                                {/* Export Selected to PDF */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExportScope('selected');
                                        setExportFormat('pdf');
                                        handleTriggerExport();
                                    }}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1"
                                    title="Export Selected to PDF (.pdf)"
                                >
                                    <span>📕 PDF</span>
                                </button>

                                {/* Print Selected */}
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 text-[11px] font-bold transition"
                                    title="Print Selected"
                                >
                                    <span>🖨️</span>
                                </button>

                                {/* Bulk Delete / Soft Delete or Restore */}
                                {!isTrash ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmModal({
                                                open: true,
                                                action: 'delete_bulk',
                                                title: 'Move Selected to Trash?',
                                                message: `Are you sure you want to soft-delete ${selectedIds.length} selected submission record(s)? They can be restored anytime from the Trash tab.`,
                                            });
                                        }}
                                        className="rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-300 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1"
                                    >
                                        <span>🗑️ Trash</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setConfirmModal({
                                                    open: true,
                                                    action: 'restore_bulk',
                                                    title: 'Restore Selected Submissions?',
                                                    message: `Restore ${selectedIds.length} selected submission(s) back to active gradebook?`,
                                                });
                                            }}
                                            className="rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 px-2.5 py-1 text-[11px] font-bold transition"
                                        >
                                            <span>♻️ Restore</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setConfirmModal({
                                                    open: true,
                                                    action: 'force_bulk',
                                                    title: 'Permanently Delete Selected?',
                                                    message: `Permanently delete ${selectedIds.length} record(s)? This action CANNOT be undone!`,
                                                });
                                            }}
                                            className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 text-[11px] font-bold transition"
                                        >
                                            <span>⚠️ Permanent</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Data Results: View Mode = Flat Table */}
                    {viewMode === 'table' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 print:hidden">
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>Consolidated Submissions Matrix</span>
                                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                                            Page {paginationMeta.current_page} of {paginationMeta.last_page} ({paginationMeta.total} total)
                                        </span>
                                    </h4>
                                </div>
                                <span className="text-[11px] font-mono text-slate-400">
                                    {isTrash ? 'Recycle Bin • Soft-Deleted Records' : 'Auto-Graded + Instructor Validated'}
                                </span>
                            </div>

                            {attemptItems.length === 0 ? (
                                <div className="p-16 text-center text-slate-400 space-y-2">
                                    <span className="text-3xl block">📋</span>
                                    <p className="font-bold text-sm text-slate-200">
                                        {isTrash ? 'Recycle bin is empty.' : 'No submission records match your query.'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {isTrash ? 'Soft-deleted records will appear here.' : 'Adjust the filters above or reset to view all trainee submissions.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3.5 w-10 text-center print:hidden">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllPageSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = isSomePageSelected;
                                                        }}
                                                        onChange={handleToggleSelectAllPage}
                                                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-4 py-3.5">Trainee &amp; Cohort</th>
                                                <th className="px-4 py-3.5">Lab Station</th>
                                                <th className="px-4 py-3.5">Mode</th>
                                                <th className="px-4 py-3.5">Score</th>
                                                <th className="px-4 py-3.5">Safety / ESD</th>
                                                <th className="px-4 py-3.5">Outcome</th>
                                                <th className="px-4 py-3.5">Duration</th>
                                                <th className="px-4 py-3.5">{isTrash ? 'Deleted Date' : 'Completed Date'}</th>
                                                <th className="px-4 py-3.5 text-right print:hidden">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 text-slate-300">
                                            {attemptItems.map((att) => {
                                                const typeMeta = getLabTypeBadge(att.lab_type);
                                                const isRowSelected = selectedIds.includes(att.id);

                                                return (
                                                    <tr
                                                        key={att.id}
                                                        className={`transition ${
                                                            isRowSelected ? 'bg-blue-950/40' : 'hover:bg-slate-800/40'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-4 text-center print:hidden">
                                                            <input
                                                                type="checkbox"
                                                                checked={isRowSelected}
                                                                onChange={() => handleToggleRow(att.id)}
                                                                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-bold text-white">{att.trainee_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{att.trainee_email}</div>
                                                            <span className="inline-block mt-1 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[9px] font-mono px-1.5 py-0.2">
                                                                {att.cohort}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-semibold text-slate-200">{att.lab_title}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">{att.course_title}</div>
                                                            <div className="mt-1">
                                                                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase border ${typeMeta.bg}`}>
                                                                    <span>{typeMeta.icon}</span>
                                                                    <span>{typeMeta.label}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                                                att.is_practice
                                                                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700/80'
                                                                    : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80'
                                                            }`}>
                                                                {att.is_practice ? '🧪 Practice' : '🏆 Graded'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {att.score !== null ? (
                                                                <div className="space-y-1">
                                                                    <span className={`text-sm font-black font-mono ${
                                                                        att.score >= att.passing_score ? 'text-emerald-400' : 'text-rose-400'
                                                                    }`}>
                                                                        {att.score}%
                                                                    </span>
                                                                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden print:hidden">
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
                                                        <td className="px-4 py-4">
                                                            <span className="font-mono text-cyan-300 font-bold">
                                                                {att.safety_score}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
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
                                                        <td className="px-4 py-4 text-slate-300 font-mono text-[11px]">
                                                            {att.duration_minutes !== null ? `${att.duration_minutes}m` : '--'}
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-400 text-[11px] font-mono">
                                                            {isTrash ? (att.deleted_at || 'Deleted') : att.completed_at}
                                                        </td>
                                                        <td className="px-4 py-4 text-right space-x-1.5 whitespace-nowrap print:hidden">
                                                            {!isTrash ? (
                                                                <>
                                                                    <Link
                                                                        href={route('instructor.submissions.review', att.id)}
                                                                        className="rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white px-2.5 py-1 text-[11px] font-bold transition inline-block shadow-sm"
                                                                    >
                                                                        Review
                                                                    </Link>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setConfirmModal({
                                                                                open: true,
                                                                                action: 'delete_single',
                                                                                targetId: att.id,
                                                                                title: 'Move Submission to Trash?',
                                                                                message: `Move attempt #${att.id} (${att.trainee_name}) to trash? You can restore it anytime.`,
                                                                            });
                                                                        }}
                                                                        className="rounded-lg bg-slate-800 hover:bg-rose-900 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-200 px-2 py-1 text-[11px] font-bold transition inline-block"
                                                                        title="Move to Trash"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setConfirmModal({
                                                                                open: true,
                                                                                action: 'restore_single',
                                                                                targetId: att.id,
                                                                                title: 'Restore Submission?',
                                                                                message: `Restore attempt #${att.id} back to active submissions?`,
                                                                            });
                                                                        }}
                                                                        className="rounded-lg bg-emerald-950 hover:bg-emerald-800 border border-emerald-700 text-emerald-300 px-2.5 py-1 text-[11px] font-bold transition inline-block"
                                                                    >
                                                                        ♻️ Restore
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setConfirmModal({
                                                                                open: true,
                                                                                action: 'force_single',
                                                                                targetId: att.id,
                                                                                title: 'Permanently Delete Submission?',
                                                                                message: `Permanently delete attempt #${att.id}? This cannot be undone.`,
                                                                            });
                                                                        }}
                                                                        className="rounded-lg bg-rose-950 hover:bg-rose-800 border border-rose-700 text-rose-300 px-2.5 py-1 text-[11px] font-bold transition inline-block"
                                                                    >
                                                                        ⚠️ Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {paginationMeta.last_page > 1 && (
                                <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/80 print:hidden">
                                    <div className="text-xs text-slate-400">
                                        Showing <span className="text-white font-bold">{paginationMeta.from}</span> to{' '}
                                        <span className="text-white font-bold">{paginationMeta.to}</span> of{' '}
                                        <span className="text-white font-bold">{paginationMeta.total}</span> records
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        {paginationMeta.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        : 'text-slate-600 cursor-not-allowed'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Results: View Mode = Grouped View */}
                    {viewMode === 'grouped' && (
                        <div className="space-y-4">
                            {groupedItems.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400 space-y-2">
                                    <span className="text-3xl block">📁</span>
                                    <p className="font-bold text-sm text-slate-200">No submission records to group.</p>
                                    <p className="text-xs text-slate-500">Adjust the filters above to populate groups.</p>
                                </div>
                            ) : (
                                groupedItems.map((group) => {
                                    const isCollapsed = collapsedGroups[group.key];
                                    const groupItemIds = group.items.map((i) => i.id);
                                    const allGroupSelected = groupItemIds.every((id) => selectedIds.includes(id));
                                    const someGroupSelected = groupItemIds.some((id) => selectedIds.includes(id)) && !allGroupSelected;

                                    const groupScored = group.items.filter((i) => i.score !== null);
                                    const groupAvg = groupScored.length > 0 ? (groupScored.reduce((acc, i) => acc + i.score, 0) / groupScored.length).toFixed(1) : 'N/A';
                                    const groupPassed = groupScored.filter((i) => i.is_passed).length;
                                    const groupPassRate = groupScored.length > 0 ? Math.round((groupPassed / groupScored.length) * 100) : 0;

                                    return (
                                        <div
                                            key={group.key}
                                            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg transition"
                                        >
                                            {/* Group Header Card */}
                                            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={allGroupSelected}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = someGroupSelected;
                                                        }}
                                                        onChange={() => handleSelectAllInGroup(group.items)}
                                                        className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 cursor-pointer print:hidden"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroupCollapse(group.key)}
                                                        className="text-left flex items-center gap-2 group"
                                                    >
                                                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                                                            {group.title}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-mono">
                                                            ▼
                                                        </span>
                                                    </button>

                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        ({group.items.length} records)
                                                    </span>

                                                    {group.subtitle && (
                                                        <span className="hidden md:inline-block rounded-md bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800">
                                                            {group.subtitle}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 print:hidden">
                                                    {/* Group KPIs */}
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-400 font-mono text-[11px]">Avg: <b className="text-emerald-400">{groupAvg}%</b></span>
                                                        <span className="text-slate-400 font-mono text-[11px]">Pass: <b className="text-blue-400">{groupPassRate}%</b></span>
                                                    </div>

                                                    {/* Quick Group Print/Export Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedIds(Array.from(new Set([...selectedIds, ...groupItemIds])));
                                                            setExportScope('selected');
                                                            setShowExportModal(true);
                                                        }}
                                                        className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-[11px] font-bold border border-slate-700 transition"
                                                    >
                                                        Export Group
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Group Collapsible Submissions Table */}
                                            {!isCollapsed && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                                                            <tr>
                                                                <th className="px-4 py-2.5 w-10 text-center print:hidden"></th>
                                                                <th className="px-4 py-2.5">Trainee</th>
                                                                <th className="px-4 py-2.5">Lab Simulator</th>
                                                                <th className="px-4 py-2.5">Score</th>
                                                                <th className="px-4 py-2.5">Outcome</th>
                                                                <th className="px-4 py-2.5">Date</th>
                                                                <th className="px-4 py-2.5 text-right print:hidden">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                                                            {group.items.map((att) => {
                                                                const isRowSelected = selectedIds.includes(att.id);
                                                                return (
                                                                    <tr
                                                                        key={att.id}
                                                                        className={`transition ${
                                                                            isRowSelected ? 'bg-blue-950/40' : 'hover:bg-slate-800/40'
                                                                        }`}
                                                                    >
                                                                        <td className="px-4 py-3 text-center print:hidden">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isRowSelected}
                                                                                onChange={() => handleToggleRow(att.id)}
                                                                                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="font-bold text-white">{att.trainee_name}</div>
                                                                            <div className="text-[10px] text-slate-400">{att.cohort}</div>
                                                                        </td>
                                                                        <td className="px-4 py-3 font-medium text-slate-200">
                                                                            {att.lab_title}
                                                                        </td>
                                                                        <td className="px-4 py-3 font-mono font-bold">
                                                                            {att.score !== null ? `${att.score}%` : 'N/A'}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                                                att.is_passed ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                                                                            }`}>
                                                                                {att.is_passed ? 'PASSED' : 'FAILED'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                                                            {att.completed_at}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right print:hidden">
                                                                            <Link
                                                                                href={route('instructor.submissions.review', att.id)}
                                                                                className="text-blue-400 hover:text-blue-300 font-bold text-xs"
                                                                            >
                                                                                Review →
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
                                    );
                                })
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Export & Print Hub Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-scaleUp">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <span>📥 Institutional Export &amp; Print Hub</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="text-slate-400 hover:text-white font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Export Scope */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                1. Target Records Scope
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                                    exportScope === 'selected' && selectedIds.length > 0
                                        ? 'border-blue-500 bg-blue-950/50 text-white'
                                        : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="exportScope"
                                        checked={exportScope === 'selected'}
                                        disabled={selectedIds.length === 0}
                                        onChange={() => setExportScope('selected')}
                                        className="text-blue-600 focus:ring-0"
                                    />
                                    <div>
                                        <div className="font-bold">Selected Records</div>
                                        <div className="text-[10px] text-slate-500">{selectedIds.length} items currently checked</div>
                                    </div>
                                </label>

                                <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                                    exportScope === 'filtered'
                                        ? 'border-blue-500 bg-blue-950/50 text-white'
                                        : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="exportScope"
                                        checked={exportScope === 'filtered'}
                                        onChange={() => setExportScope('filtered')}
                                        className="text-blue-600 focus:ring-0"
                                    />
                                    <div>
                                        <div className="font-bold">All Filtered Records</div>
                                        <div className="text-[10px] text-slate-500">{kpis.total_attempts || 0} total matching query</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Export Format */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                2. Document Format
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setExportFormat('pdf')}
                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                                        exportFormat === 'pdf' ? 'border-emerald-500 bg-emerald-950/40 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                                    }`}
                                >
                                    <span className="text-xl">📕</span>
                                    <div>
                                        <div className="font-bold text-white">Adobe PDF (.pdf)</div>
                                        <div className="text-[10px] text-slate-400">Formal printable report</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setExportFormat('docx')}
                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                                        exportFormat === 'docx' ? 'border-blue-500 bg-blue-950/40 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                                    }`}
                                >
                                    <span className="text-xl">📘</span>
                                    <div>
                                        <div className="font-bold text-white">Microsoft Word (.docx)</div>
                                        <div className="text-[10px] text-slate-400">Editable DOCX with tables</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setExportFormat('csv')}
                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                                        exportFormat === 'csv' ? 'border-amber-500 bg-amber-950/40 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                                    }`}
                                >
                                    <span className="text-xl">📊</span>
                                    <div>
                                        <div className="font-bold text-white">Excel / CSV (.csv)</div>
                                        <div className="text-[10px] text-slate-400">Raw dataset spreadsheet</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setExportFormat('print')}
                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                                        exportFormat === 'print' ? 'border-purple-500 bg-purple-950/40 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                                    }`}
                                >
                                    <span className="text-xl">🖨️</span>
                                    <div>
                                        <div className="font-bold text-white">Browser Print</div>
                                        <div className="text-[10px] text-slate-400">Direct print layout</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Document Grouping */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                3. Document Grouping Structure
                            </label>
                            <select
                                value={exportGroupBy}
                                onChange={(e) => setExportGroupBy(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500"
                            >
                                <option value="trainee">Group by Trainee Candidate</option>
                                <option value="lab">Group by Lab Simulation Station</option>
                                <option value="cohort">Group by Cohort / Academic Batch</option>
                                <option value="module">Group by Course Curriculum &amp; Module</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleTriggerExport}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold transition shadow-md flex items-center gap-1.5"
                            >
                                <span>🚀 Generate &amp; Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
