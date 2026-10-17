import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ComponentsIndex({ components = [], filters = {}, categoriesCount = {}, totalCount = 0 }) {
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSocket, setSelectedSocket] = useState(filters.socket || 'all');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || 'all');
    const [activeModalComponent, setActiveModalComponent] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState('specs'); // 'specs' | 'diagnostics' | 'failures'

    const categories = [
        { key: 'all', label: 'All Equipment', icon: '📦' },
        { key: 'cpu', label: 'Processors (CPUs)', icon: '🧠' },
        { key: 'motherboard', label: 'Motherboards', icon: '🎛️' },
        { key: 'gpu', label: 'Graphics Cards (GPUs)', icon: '🎮' },
        { key: 'psu', label: 'Power Supplies (PSUs)', icon: '⚡' },
        { key: 'ram', label: 'Memory (RAM)', icon: '💾' },
        { key: 'storage', label: 'Storage (SSDs & HDDs)', icon: '💿' },
        { key: 'cooling', label: 'Coolers & AIOs', icon: '❄️' },
        { key: 'chassis', label: 'Chassis & Cases', icon: '🖥️' },
    ];

    const handleFilterChange = (catKey, sockVal = selectedSocket, brandVal = selectedBrand) => {
        setSelectedCategory(catKey);
        router.get(route('components.index'), {
            category: catKey,
            socket: sockVal !== 'all' ? sockVal : undefined,
            brand: brandVal !== 'all' ? brandVal : undefined,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        router.get(route('components.index'), {
            category: selectedCategory,
            socket: selectedSocket !== 'all' ? selectedSocket : undefined,
            brand: selectedBrand !== 'all' ? selectedBrand : undefined,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'cpu':
                return { label: 'CPU Processor', bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60', icon: '🧠' };
            case 'motherboard':
                return { label: 'Motherboard', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60', icon: '🎛️' };
            case 'gpu':
                return { label: 'Dedicated GPU', bg: 'bg-rose-950/80 text-rose-300 border-rose-700/60', icon: '🎮' };
            case 'psu':
                return { label: 'Power Supply Unit', bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60', icon: '⚡' };
            case 'ram':
                return { label: 'DDR Memory', bg: 'bg-teal-950/80 text-teal-300 border-teal-700/60', icon: '💾' };
            case 'storage':
                return { label: 'NVMe / Storage', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60', icon: '💿' };
            case 'cooling':
                return { label: 'Thermal Cooling', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60', icon: '❄️' };
            case 'chassis':
                return { label: 'PC Enclosure', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60', icon: '🖥️' };
            default:
                return { label: 'Component', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: '🔧' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-md bg-blue-950/80 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800/80 uppercase tracking-widest font-mono">
                                Hardware Catalog & Spec Sheet
                            </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-white mt-1">
                            Centralized Hardware Inventory & Telemetry Reference
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('sizing.index')}
                            className="rounded-xl border border-amber-500/60 bg-amber-950/50 hover:bg-amber-900/60 px-3.5 py-2 text-xs font-bold text-amber-300 transition shadow-sm flex items-center gap-1.5"
                        >
                            <span>⚡ PSU Sizing Calculator</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Hardware Component Inventory & Specs" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Category Filter Pills Bar */}
                    <div className="overflow-x-auto pb-2">
                        <div className="flex items-center gap-2 min-w-max">
                            {categories.map((c) => {
                                const count = c.key === 'all' ? totalCount : (categoriesCount[c.key] || 0);
                                const isSelected = selectedCategory === c.key;
                                return (
                                    <button
                                        key={c.key}
                                        type="button"
                                        onClick={() => handleFilterChange(c.key)}
                                        className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 border shadow-sm ${
                                            isSelected
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-blue-950/50'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
                                        }`}
                                    >
                                        <span>{c.icon}</span>
                                        <span>{c.label}</span>
                                        <span className={`text-[10px] font-mono rounded-md px-1.5 py-0.2 ${
                                            isSelected ? 'bg-blue-800/80 text-blue-200' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search and Secondary Filter Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
                        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by model, brand, socket, power rating, or architecture..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm shrink-0"
                            >
                                Search Catalog
                            </button>
                            {(searchTerm || selectedCategory !== 'all' || selectedSocket !== 'all' || selectedBrand !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSocket('all');
                                        setSelectedBrand('all');
                                        handleFilterChange('all', 'all', 'all');
                                    }}
                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 text-xs font-semibold transition shrink-0"
                                >
                                    Reset
                                </button>
                            )}
                        </form>

                        <div className="flex items-center gap-3">
                            {/* Socket Filter */}
                            <select
                                value={selectedSocket}
                                onChange={(e) => {
                                    setSelectedSocket(e.target.value);
                                    handleFilterChange(selectedCategory, e.target.value, selectedBrand);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500"
                            >
                                <option value="all">Socket: All</option>
                                <option value="LGA1700">Intel LGA1700</option>
                                <option value="AM5">AMD AM5</option>
                                <option value="AM4">AMD AM4</option>
                            </select>

                            {/* Brand Filter */}
                            <select
                                value={selectedBrand}
                                onChange={(e) => {
                                    setSelectedBrand(e.target.value);
                                    handleFilterChange(selectedCategory, selectedSocket, e.target.value);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500"
                            >
                                <option value="all">Brand: All</option>
                                <option value="Intel">Intel</option>
                                <option value="AMD">AMD</option>
                                <option value="NVIDIA">NVIDIA</option>
                                <option value="ASUS">ASUS</option>
                                <option value="MSI">MSI</option>
                                <option value="Corsair">Corsair</option>
                                <option value="Seasonic">Seasonic</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Noctua">Noctua</option>
                                <option value="Arctic">Arctic</option>
                                <option value="Lian Li">Lian Li</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span>Showing <strong className="text-white font-mono">{components.length}</strong> equipment component(s)</span>
                        <span className="text-[11px] text-slate-400">All parts standardized with factory electrical, dimensional & diagnostic parameters.</span>
                    </div>

                    {/* Components Grid */}
                    {components.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400 space-y-3">
                            <span className="text-4xl block">🔍</span>
                            <h4 className="text-base font-bold text-slate-200">No components match your search criteria</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Try searching for broad terms such as "DDR5", "LGA1700", "PCIe", "1000W", or clear your category filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {components.map((c) => {
                                const badge = getCategoryBadge(c.category);
                                return (
                                    <div
                                        key={c.id}
                                        className="rounded-2xl border border-slate-800 hover:border-blue-500/60 bg-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        <div>
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border ${badge.bg}`}>
                                                    <span>{badge.icon}</span>
                                                    <span>{badge.label}</span>
                                                </span>

                                                <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider font-mono">
                                                    {c.brand}
                                                </span>
                                            </div>

                                            {c.socket && (
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                                                    Socket {c.socket}
                                                </span>
                                            )}

                                            <h3 className="text-base font-black text-white leading-snug group-hover:text-blue-400 transition">
                                                {c.name}
                                            </h3>

                                            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                                                {c.short_desc}
                                            </p>

                                            {/* Key Specs Preview Pills */}
                                            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                                                {Object.entries(c.specs || {}).slice(0, 4).map(([key, val]) => (
                                                    <div key={key} className="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{key}</div>
                                                        <div className="font-semibold text-slate-200 truncate mt-0.5">{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveModalComponent(c);
                                                    setActiveDetailTab('specs');
                                                }}
                                                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-md transition text-center flex items-center justify-center gap-1.5"
                                            >
                                                <span>🔍 View Blueprint & Specs</span>
                                            </button>

                                            <Link
                                                href={route('sizing.index')}
                                                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white px-3 py-2.5 text-xs font-bold transition text-center"
                                                title="Calculate PSU wattage and check bottlenecks for this component"
                                            >
                                                ⚡
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            {/* Component Detail & Diagnostic Blueprint Modal */}
            {activeModalComponent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-3xl rounded-2xl bg-slate-900 p-6 md:p-8 shadow-2xl border border-slate-700 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold border ${getCategoryBadge(activeModalComponent.category).bg}`}>
                                        <span>{getCategoryBadge(activeModalComponent.category).icon}</span>
                                        <span>{getCategoryBadge(activeModalComponent.category).label}</span>
                                    </span>
                                    <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 font-mono">
                                        {activeModalComponent.brand}
                                    </span>
                                    {activeModalComponent.socket && (
                                        <span className="rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold px-2 py-0.5 font-mono">
                                            {activeModalComponent.socket}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-white">
                                    {activeModalComponent.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {activeModalComponent.short_desc}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModalComponent(null)}
                                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 transition text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <button
                                type="button"
                                onClick={() => setActiveDetailTab('specs')}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeDetailTab === 'specs'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white bg-slate-950'
                                }`}
                            >
                                <span>📋 Technical Specifications</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveDetailTab('diagnostics')}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeDetailTab === 'diagnostics'
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white bg-slate-950'
                                }`}
                            >
                                <span>⚡ Multimeter & Diagnostic Telemetry</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveDetailTab('failures')}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeDetailTab === 'failures'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white bg-slate-950'
                                }`}
                            >
                                <span>🔍 Failure Modes & Maintenance</span>
                            </button>
                        </div>

                        {/* Tab Content: Technical Specifications */}
                        {activeDetailTab === 'specs' && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Factory Architecture & Spec Sheet
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(activeModalComponent.specs || {}).map(([key, val]) => (
                                        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{key}</span>
                                            <span className="text-xs font-semibold text-slate-200 mt-1">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Diagnostic Telemetry */}
                        {activeDetailTab === 'diagnostics' && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                    Multimeter Voltage Rails & Thermal Operational Thresholds
                                </h4>
                                <div className="space-y-3">
                                    {Object.entries(activeModalComponent.diagnostic_telemetry || {}).map(([key, val]) => (
                                        <div key={key} className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs font-medium text-slate-200 font-mono">
                                                {val}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Failure Modes & Maintenance */}
                        {activeDetailTab === 'failures' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
                                        Frequent Field Failures & Troubleshooting Symptoms
                                    </h4>
                                    <ul className="space-y-2">
                                        {(activeModalComponent.common_failures || []).map((fail, idx) => (
                                            <li key={idx} className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5 text-xs text-rose-200/90 flex items-start gap-2.5">
                                                <span className="text-rose-400 font-bold">⚠️</span>
                                                <span>{fail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {activeModalComponent.maintenance_tips && (
                                    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                                            <span>🛠️ Standard Operating Maintenance SOP</span>
                                        </h5>
                                        <p className="text-xs text-emerald-200/90 leading-relaxed">
                                            {activeModalComponent.maintenance_tips}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-[11px] text-slate-400">
                                Integrated with Lab Simulations & Power Sizing Engine.
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('sizing.index')}
                                    className="rounded-xl border border-amber-700/80 bg-amber-950/80 hover:bg-amber-900 px-4 py-2 text-xs font-bold text-amber-300 transition flex items-center gap-1.5"
                                >
                                    <span>⚡ Open Sizing Calculator</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setActiveModalComponent(null)}
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition"
                                >
                                    Close Blueprint
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
