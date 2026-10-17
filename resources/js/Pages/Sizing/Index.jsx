import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Zap,
    Cpu,
    Monitor,
    HardDrive,
    Fan,
    Gauge,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Layers,
    Info,
    ArrowRight,
    RotateCcw,
    Sliders,
    Thermometer,
    Download,
    TrendingUp
} from 'lucide-react';

// Comprehensive Database of Real-World Processors
const CPU_DATABASE = [
    { id: 'i9_14900k', name: 'Intel Core i9-14900K', socket: 'LGA1700', baseTdp: 125, boostTdp: 253, cores: 24, ramGen: ['DDR4', 'DDR5'], igpu: true, perfScore: 98 },
    { id: 'i7_14700k', name: 'Intel Core i7-14700K', socket: 'LGA1700', baseTdp: 125, boostTdp: 253, cores: 20, ramGen: ['DDR4', 'DDR5'], igpu: true, perfScore: 92 },
    { id: 'i5_14600k', name: 'Intel Core i5-14600K', socket: 'LGA1700', baseTdp: 125, boostTdp: 181, cores: 14, ramGen: ['DDR4', 'DDR5'], igpu: true, perfScore: 82 },
    { id: 'i5_14400', name: 'Intel Core i5-14400', socket: 'LGA1700', baseTdp: 65, boostTdp: 148, cores: 10, ramGen: ['DDR4', 'DDR5'], igpu: true, perfScore: 71 },
    { id: 'i3_14100', name: 'Intel Core i3-14100', socket: 'LGA1700', baseTdp: 60, boostTdp: 110, cores: 4, ramGen: ['DDR4', 'DDR5'], igpu: true, perfScore: 54 },
    { id: 'r9_7950x', name: 'AMD Ryzen 9 7950X', socket: 'AM5', baseTdp: 170, boostTdp: 230, cores: 16, ramGen: ['DDR5'], igpu: true, perfScore: 97 },
    { id: 'r7_7800x3d', name: 'AMD Ryzen 7 7800X3D', socket: 'AM5', baseTdp: 120, boostTdp: 162, cores: 8, ramGen: ['DDR5'], igpu: true, perfScore: 94 },
    { id: 'r7_7700x', name: 'AMD Ryzen 7 7700X', socket: 'AM5', baseTdp: 105, boostTdp: 142, cores: 8, ramGen: ['DDR5'], igpu: true, perfScore: 84 },
    { id: 'r5_7600x', name: 'AMD Ryzen 5 7600X', socket: 'AM5', baseTdp: 105, boostTdp: 142, cores: 6, ramGen: ['DDR5'], igpu: true, perfScore: 76 },
    { id: 'r5_5600x', name: 'AMD Ryzen 5 5600X', socket: 'AM4', baseTdp: 65, boostTdp: 88, cores: 6, ramGen: ['DDR4'], igpu: false, perfScore: 65 }
];

// Comprehensive Database of Graphics Cards
const GPU_DATABASE = [
    { id: 'none', name: 'Integrated Graphics (No discrete GPU)', tdp: 0, vram: 0, pcieCables: 0, perfScore: 10 },
    { id: 'rtx_4090', name: 'NVIDIA GeForce RTX 4090 24GB', tdp: 450, vram: 24, pcieCables: 4, perfScore: 100 },
    { id: 'rtx_4080s', name: 'NVIDIA GeForce RTX 4080 Super 16GB', tdp: 320, vram: 16, pcieCables: 3, perfScore: 88 },
    { id: 'rtx_4070ti_s', name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB', tdp: 285, vram: 16, pcieCables: 2, perfScore: 79 },
    { id: 'rtx_4070s', name: 'NVIDIA GeForce RTX 4070 Super 12GB', tdp: 220, vram: 12, pcieCables: 2, perfScore: 71 },
    { id: 'rtx_4060ti', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', tdp: 160, vram: 8, pcieCables: 1, perfScore: 56 },
    { id: 'rtx_4060', name: 'NVIDIA GeForce RTX 4060 8GB', tdp: 115, vram: 8, pcieCables: 1, perfScore: 48 },
    { id: 'rx_7900xtx', name: 'AMD Radeon RX 7900 XTX 24GB', tdp: 355, vram: 24, pcieCables: 3, perfScore: 89 },
    { id: 'rx_7800xt', name: 'AMD Radeon RX 7800 XT 16GB', tdp: 263, vram: 16, pcieCables: 2, perfScore: 72 },
    { id: 'rx_7600', name: 'AMD Radeon RX 7600 8GB', tdp: 165, vram: 8, pcieCables: 1, perfScore: 47 }
];

// Motherboard Platforms
const MOTHERBOARD_PLATFORMS = [
    { id: 'z790', name: 'Intel Z790 Enthusiast (LGA1700 - DDR5/DDR4)', socket: 'LGA1700', ramGen: 'DDR5', power: 65, pcieGen: 'PCIe 5.0' },
    { id: 'b760', name: 'Intel B760 Mainstream (LGA1700 - DDR5)', socket: 'LGA1700', ramGen: 'DDR5', power: 45, pcieGen: 'PCIe 4.0' },
    { id: 'b760_ddr4', name: 'Intel B760 Budget (LGA1700 - DDR4)', socket: 'LGA1700', ramGen: 'DDR4', power: 45, pcieGen: 'PCIe 4.0' },
    { id: 'x670e', name: 'AMD X670E High-End (AM5 - DDR5 Only)', socket: 'AM5', ramGen: 'DDR5', power: 60, pcieGen: 'PCIe 5.0' },
    { id: 'b650', name: 'AMD B650 Mainstream (AM5 - DDR5 Only)', socket: 'AM5', ramGen: 'DDR5', power: 40, pcieGen: 'PCIe 4.0' },
    { id: 'b550', name: 'AMD B550 Legacy (AM4 - DDR4 Only)', socket: 'AM4', ramGen: 'DDR4', power: 35, pcieGen: 'PCIe 4.0' }
];

// CPU Cooler Profiles
const COOLER_PROFILES = [
    { id: 'stock_air', name: 'Standard Stock Air Cooler (Single 90mm Fan)', tdpRating: 65, power: 4, type: 'Air' },
    { id: 'tower_air_single', name: '120mm Single Tower Air Cooler (e.g. Peerless Assassin)', tdpRating: 180, power: 6, type: 'Air' },
    { id: 'tower_air_dual', name: 'Dual-Tower High-Performance Air Cooler (e.g. NH-D15)', tdpRating: 250, power: 8, type: 'Air' },
    { id: 'aio_240', name: '240mm AIO Liquid Cooler (Dual Fan + Pump)', tdpRating: 260, power: 16, type: 'AIO Liquid' },
    { id: 'aio_360', name: '360mm AIO Liquid Cooler (Triple Fan + Pump)', tdpRating: 350, power: 22, type: 'AIO Liquid' },
    { id: 'custom_loop', name: 'Custom Open-Loop Water Cooling (High-Flow Pump + Rad)', tdpRating: 450, power: 35, type: 'Custom Liquid' }
];

export default function Index() {
    // Top Tabs: 'psu_sizing' vs 'bottleneck_analyzer'
    const [activeTab, setActiveTab] = useState('psu_sizing'); // 'psu_sizing' | 'bottleneck_analyzer'

    // Form State
    const [selectedCpuId, setSelectedCpuId] = useState('i7_14700k');
    const [selectedGpuId, setSelectedGpuId] = useState('rtx_4070ti_s');
    const [selectedMbId, setSelectedMbId] = useState('b760');
    const [selectedCoolerId, setSelectedCoolerId] = useState('aio_240');
    
    // RAM & Storage Counts
    const [ramSticks, setRamSticks] = useState(2); // 2 or 4 sticks
    const [ramCapacity, setRamCapacity] = useState(32); // GB
    const [ramRgb, setRamRgb] = useState(true);

    const [nvmeCount, setNvmeCount] = useState(2);
    const [sataSsdCount, setSataSsdCount] = useState(1);
    const [hddCount, setHddCount] = useState(0);

    // Fans & Accessories
    const [caseFanCount, setCaseFanCount] = useState(4);
    const [rgbStripsCount, setRgbStripsCount] = useState(2);
    const [overclockHeadroom, setOverclockHeadroom] = useState(true); // +15% power spike safety

    // Bottleneck Resolution Target
    const [resolutionTarget, setResolutionTarget] = useState('1440p'); // '1080p' | '1440p' | '4k'

    // Current Selected Object Lookups
    const cpu = useMemo(() => CPU_DATABASE.find(c => c.id === selectedCpuId) || CPU_DATABASE[0], [selectedCpuId]);
    const gpu = useMemo(() => GPU_DATABASE.find(g => g.id === selectedGpuId) || GPU_DATABASE[0], [selectedGpuId]);
    const mb = useMemo(() => MOTHERBOARD_PLATFORMS.find(m => m.id === selectedMbId) || MOTHERBOARD_PLATFORMS[0], [selectedMbId]);
    const cooler = useMemo(() => COOLER_PROFILES.find(co => co.id === selectedCoolerId) || COOLER_PROFILES[0], [selectedCoolerId]);

    // =========================================================================
    // 1. CALCULATE ELECTRICAL POWER CONSUMPTION (WATTS & AMPS)
    // =========================================================================
    const powerCalculations = useMemo(() => {
        // CPU Power (Boost peak)
        const cpuWattage = cpu.boostTdp;
        // GPU Power
        const gpuWattage = gpu.tdp;
        // Motherboard Base Power
        const mbWattage = mb.power;
        // RAM Power (DDR5 ~ 4W per stick + 2W for RGB)
        const ramWattage = (ramSticks * 4) + (ramRgb ? ramSticks * 2 : 0);
        // Storage Power
        const nvmeWattage = nvmeCount * 7.5; // ~7.5W under PCIe Gen4 peak write
        const sataSsdWattage = sataSsdCount * 4.0;
        const hddWattage = hddCount * 11.0; // spin-up peak
        // Cooling Power
        const coolerWattage = cooler.power;
        // Case Fans (3W each) + RGB Strips (4W each)
        const fansWattage = (caseFanCount * 3.5) + (rgbStripsCount * 4.0);

        // Sum Total Peak System Load
        const rawPeakWatts = cpuWattage + gpuWattage + mbWattage + ramWattage + nvmeWattage + sataSsdWattage + hddWattage + coolerWattage + fansWattage;

        // Apply 15% transient power spike headroom if enabled
        const peakWattsWithHeadroom = overclockHeadroom ? Math.round(rawPeakWatts * 1.15) : Math.round(rawPeakWatts);

        // Recommended Standard PSU Wattages: 450, 550, 650, 750, 850, 1000, 1200, 1600
        const psuSizes = [450, 550, 650, 750, 850, 1000, 1200, 1600];
        // Standard rule: PSU should run at around 55% - 70% load under max gaming load for optimal 80 PLUS efficiency
        const targetCapacity = Math.round(peakWattsWithHeadroom * 1.25);
        const recommendedPsuWatts = psuSizes.find(s => s >= targetCapacity) || 1600;

        // Single +12V Rail Demand (CPU + GPU + Cooler + Fans)
        const plus12vWatts = (cpuWattage * 0.95) + gpuWattage + (coolerWattage * 0.9) + (fansWattage * 0.9);
        const plus12vAmps = +(plus12vWatts / 12.0).toFixed(1);

        // Minor Rails (+5V and +3.3V)
        const minorRailsWatts = mbWattage + ramWattage + nvmeWattage + sataSsdWattage + (hddCount * 4);
        const minorRailsCombinedAmps = +(minorRailsWatts / 5.0).toFixed(1);

        // Efficiency Sweet Spot (50% of recommended PSU)
        const sweetSpotWatts = Math.round(recommendedPsuWatts * 0.5);

        return {
            rawPeakWatts: Math.round(rawPeakWatts),
            peakWattsWithHeadroom,
            recommendedPsuWatts,
            plus12vWatts: Math.round(plus12vWatts),
            plus12vAmps,
            minorRailsWatts: Math.round(minorRailsWatts),
            minorRailsCombinedAmps,
            sweetSpotWatts,
            loadPercentage: Math.round((peakWattsWithHeadroom / recommendedPsuWatts) * 100),
            breakdown: [
                { label: 'Processor (CPU Boost Peak)', watts: cpuWattage, color: 'text-blue-400', barColor: 'bg-blue-500' },
                { label: 'Graphics Card (GPU Board Power)', watts: gpuWattage, color: 'text-orange-400', barColor: 'bg-orange-500' },
                { label: 'Motherboard VRM & Chipset', watts: mbWattage, color: 'text-purple-400', barColor: 'bg-purple-500' },
                { label: `System Memory (${ramSticks}x DDR DIMMs)`, watts: ramWattage, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
                { label: `Storage Drives (${nvmeCount} M.2, ${sataSsdCount} SATA, ${hddCount} HDD)`, watts: Math.round(nvmeWattage + sataSsdWattage + hddWattage), color: 'text-amber-400', barColor: 'bg-amber-500' },
                { label: 'Cooling & Case Fans', watts: Math.round(coolerWattage + fansWattage), color: 'text-cyan-400', barColor: 'bg-cyan-500' },
            ]
        };
    }, [cpu, gpu, mb, cooler, ramSticks, ramRgb, nvmeCount, sataSsdCount, hddCount, caseFanCount, rgbStripsCount, overclockHeadroom]);

    // =========================================================================
    // 2. CALCULATE SYSTEM COMPATIBILITY & BOTTLENECK ANALYSIS
    // =========================================================================
    const compatibilityCheck = useMemo(() => {
        const issues = [];
        let isCriticalMismatch = false;

        // 1. Socket Check (CPU socket vs Motherboard socket)
        if (cpu.socket !== mb.socket) {
            issues.push({
                type: 'error',
                title: 'CRITICAL SOCKET INCOMPATIBILITY',
                description: `The selected ${cpu.name} requires socket ${cpu.socket}, but the ${mb.name} has socket ${mb.socket}. The processor will physically not fit in the socket!`
            });
            isCriticalMismatch = true;
        } else {
            issues.push({
                type: 'success',
                title: 'Socket Match Confirmed',
                description: `Both processor and motherboard share the ${cpu.socket} socket standard.`
            });
        }

        // 2. RAM Generation Check
        if (!cpu.ramGen.includes(mb.ramGen)) {
            issues.push({
                type: 'error',
                title: 'MEMORY STANDARD CONFLICT',
                description: `The motherboard uses ${mb.ramGen} memory slots, which is incompatible with the CPU memory controller standard.`
            });
            isCriticalMismatch = true;
        } else {
            issues.push({
                type: 'success',
                title: 'Memory Standard Aligned',
                description: `${mb.ramGen} slots operate natively with processor memory controller.`
            });
        }

        // 3. Thermal Dissipation Check (Cooler TDP vs CPU Boost TDP)
        if (cooler.tdpRating < cpu.boostTdp) {
            const deficit = cpu.boostTdp - cooler.tdpRating;
            issues.push({
                type: 'warning',
                title: 'THERMAL THROTTLING RISK',
                description: `Cooler dissipation rating (${cooler.tdpRating}W) is lower than the CPU's peak boost TDP (${cpu.boostTdp}W) by ${deficit}W. The CPU will frequently hit thermal limits (95°C-100°C) and reduce clock speeds under full multi-core load.`
            });
        } else {
            const margin = cooler.tdpRating - cpu.boostTdp;
            issues.push({
                type: 'success',
                title: 'Adequate Thermal Headroom',
                description: `The ${cooler.name} provides ${cooler.tdpRating}W dissipation, delivering a safe +${margin}W thermal buffer.`
            });
        }

        // 4. Bottleneck Percentage Evaluation
        // Weightings adjust depending on resolution target:
        // 1080p: CPU heavy
        // 1440p: Balanced
        // 4K: GPU heavy
        const resMultiplier = {
            '1080p': { cpuWeight: 1.25, gpuWeight: 0.85 },
            '1440p': { cpuWeight: 1.0, gpuWeight: 1.0 },
            '4k': { cpuWeight: 0.75, gpuWeight: 1.35 }
        }[resolutionTarget];

        const effectiveCpuScore = cpu.perfScore * resMultiplier.cpuWeight;
        const effectiveGpuScore = gpu.perfScore * resMultiplier.gpuWeight;

        let bottleneckPct = 0;
        let bottleneckType = 'balanced';
        let bottleneckMessage = '';

        if (gpu.id === 'none') {
            bottleneckPct = 85;
            bottleneckType = 'gpu';
            bottleneckMessage = 'Integrated graphics will be the severe bottleneck for 3D graphics and gaming tasks.';
        } else if (effectiveGpuScore > effectiveCpuScore * 1.3) {
            // GPU is way faster than CPU -> CPU bottleneck
            bottleneckPct = Math.min(60, Math.round(((effectiveGpuScore - effectiveCpuScore) / effectiveGpuScore) * 100));
            bottleneckType = 'cpu';
            bottleneckMessage = `Your ${cpu.name} may hold back the ${gpu.name} in high-framerate scenarios. The GPU will wait on CPU draw calls.`;
        } else if (effectiveCpuScore > effectiveGpuScore * 1.3) {
            // CPU is way faster than GPU -> GPU bottleneck (common at 4K)
            bottleneckPct = Math.min(60, Math.round(((effectiveCpuScore - effectiveGpuScore) / effectiveCpuScore) * 100));
            bottleneckType = 'gpu';
            bottleneckMessage = `Your ${gpu.name} will run at 100% utilization while the ${cpu.name} has spare compute headroom. This is ideal for 4K visual fidelity.`;
        } else {
            bottleneckPct = Math.max(2, Math.round(Math.abs(effectiveCpuScore - effectiveGpuScore) * 0.35));
            bottleneckType = 'balanced';
            bottleneckMessage = `Well-balanced configuration! Both CPU and GPU will operate harmoniously with minimal bottlenecking at ${resolutionTarget}.`;
        }

        return {
            issues,
            isCriticalMismatch,
            bottleneckPct,
            bottleneckType,
            bottleneckMessage
        };
    }, [cpu, gpu, mb, cooler, resolutionTarget]);

    // Quick Build Presets Handler
    const applyPreset = (presetName) => {
        if (presetName === 'esports') {
            setSelectedCpuId('i3_14100');
            setSelectedGpuId('rtx_4060');
            setSelectedMbId('b760_ddr4');
            setSelectedCoolerId('stock_air');
            setRamSticks(2);
            setRamCapacity(16);
            setRamRgb(false);
            setNvmeCount(1);
            setSataSsdCount(0);
            setHddCount(0);
            setCaseFanCount(2);
        } else if (presetName === 'midrange') {
            setSelectedCpuId('r7_7800x3d');
            setSelectedGpuId('rtx_4070ti_s');
            setSelectedMbId('b650');
            setSelectedCoolerId('aio_240');
            setRamSticks(2);
            setRamCapacity(32);
            setRamRgb(true);
            setNvmeCount(2);
            setSataSsdCount(1);
            setHddCount(0);
            setCaseFanCount(4);
        } else if (presetName === 'flagship') {
            setSelectedCpuId('i9_14900k');
            setSelectedGpuId('rtx_4090');
            setSelectedMbId('z790');
            setSelectedCoolerId('aio_360');
            setRamSticks(4);
            setRamCapacity(64);
            setRamRgb(true);
            setNvmeCount(3);
            setSataSsdCount(2);
            setHddCount(1);
            setCaseFanCount(6);
        } else if (presetName === 'office') {
            setSelectedCpuId('i5_14400');
            setSelectedGpuId('none');
            setSelectedMbId('b760_ddr4');
            setSelectedCoolerId('stock_air');
            setRamSticks(2);
            setRamCapacity(16);
            setRamRgb(false);
            setNvmeCount(1);
            setSataSsdCount(0);
            setHddCount(0);
            setCaseFanCount(1);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="PC Power Supply & Component Sizing Calculator" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Top Hero Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950 p-6 md:p-8 border border-slate-800 shadow-2xl">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Hardware Sizing & Electrical Load Analyzer</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    PC Power Supply & Bottleneck Calculator
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                                    Calculate continuous & peak electrical wattages, single-rail 12V amperage draw, thermal cooler margins, and CPU/GPU bottleneck ratios across custom desktop builds.
                                </p>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block w-full md:w-auto">
                                    Quick Presets:
                                </span>
                                <button
                                    onClick={() => applyPreset('esports')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                                >
                                    🎮 Esports 1080p
                                </button>
                                <button
                                    onClick={() => applyPreset('midrange')}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-xs font-semibold text-blue-300 border border-blue-500/40 transition"
                                >
                                    🚀 Gaming 1440p
                                </button>
                                <button
                                    onClick={() => applyPreset('flagship')}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-xs font-semibold text-purple-300 border border-purple-500/40 transition"
                                >
                                    👑 Flagship 4K / AI
                                </button>
                                <button
                                    onClick={() => applyPreset('office')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                                >
                                    🏢 Office PC
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-md">
                        <button
                            onClick={() => setActiveTab('psu_sizing')}
                            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition ${
                                activeTab === 'psu_sizing'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Zap className="h-4 w-4" />
                            <span>1. PSU Wattage & Electrical Rail Capacity</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('bottleneck_analyzer')}
                            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition ${
                                activeTab === 'bottleneck_analyzer'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Gauge className="h-4 w-4" />
                            <span>2. Hardware Bottleneck & Compatibility Engine</span>
                        </button>
                    </div>

                    {/* TAB 1: PSU SIZING & ELECTRICAL POWER BUDGET */}
                    {activeTab === 'psu_sizing' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left Column: Component Customizer Form (7 Cols) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center space-x-2 text-blue-400">
                                            <Sliders className="h-5 w-5" />
                                            <h2 className="text-base font-extrabold text-white">System Component Selection</h2>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">Real-world TDP database</span>
                                    </div>

                                    {/* 1. Processor (CPU) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Cpu className="h-4 w-4 mr-1.5 text-blue-400" /> Processor (CPU)
                                            </span>
                                            <span className="text-blue-400 font-mono text-[11px] font-bold">
                                                Boost TDP: {cpu.boostTdp}W
                                            </span>
                                        </label>
                                        <select
                                            value={selectedCpuId}
                                            onChange={(e) => setSelectedCpuId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500"
                                        >
                                            {CPU_DATABASE.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.cores} Cores, Socket {c.socket}) - Base {c.baseTdp}W / Peak {c.boostTdp}W
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Graphics Card (GPU) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Monitor className="h-4 w-4 mr-1.5 text-orange-400" /> Graphics Card (GPU)
                                            </span>
                                            <span className="text-orange-400 font-mono text-[11px] font-bold">
                                                Board Power: {gpu.tdp}W
                                            </span>
                                        </label>
                                        <select
                                            value={selectedGpuId}
                                            onChange={(e) => setSelectedGpuId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-orange-500"
                                        >
                                            {GPU_DATABASE.map(g => (
                                                <option key={g.id} value={g.id}>
                                                    {g.name} - TDP {g.tdp}W ({g.pcieCables > 0 ? `${g.pcieCables}x PCIe 8-Pin` : 'No PCIe Cable'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Motherboard Platform */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Layers className="h-4 w-4 mr-1.5 text-purple-400" /> Motherboard Platform
                                            </span>
                                            <span className="text-purple-400 font-mono text-[11px] font-bold">
                                                VRM & Chipset: {mb.power}W
                                            </span>
                                        </label>
                                        <select
                                            value={selectedMbId}
                                            onChange={(e) => setSelectedMbId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-purple-500"
                                        >
                                            {MOTHERBOARD_PLATFORMS.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} - {m.power}W
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. CPU Cooling Solution */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Thermometer className="h-4 w-4 mr-1.5 text-cyan-400" /> CPU Cooling Solution
                                            </span>
                                            <span className="text-cyan-400 font-mono text-[11px] font-bold">
                                                Dissipation: {cooler.tdpRating}W | Pump/Fans: {cooler.power}W
                                            </span>
                                        </label>
                                        <select
                                            value={selectedCoolerId}
                                            onChange={(e) => setSelectedCoolerId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500"
                                        >
                                            {COOLER_PROFILES.map(co => (
                                                <option key={co.id} value={co.id}>
                                                    {co.name} (Rated up to {co.tdpRating}W TDP)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 5. Memory & Storage Sliders */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                                        {/* RAM */}
                                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                <span>Memory (RAM) DIMMs</span>
                                                <span className="text-emerald-400">{ramSticks} Sticks ({ramCapacity}GB)</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    value={ramSticks}
                                                    onChange={(e) => setRamSticks(Number(e.target.value))}
                                                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                                                >
                                                    <option value={1}>1x Stick (Single)</option>
                                                    <option value={2}>2x Sticks (Dual-Ch)</option>
                                                    <option value={4}>4x Sticks (Quad DIMM)</option>
                                                </select>
                                                <select
                                                    value={ramCapacity}
                                                    onChange={(e) => setRamCapacity(Number(e.target.value))}
                                                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                                                >
                                                    <option value={16}>16 GB</option>
                                                    <option value={32}>32 GB</option>
                                                    <option value={64}>64 GB</option>
                                                    <option value={128}>128 GB</option>
                                                </select>
                                            </div>
                                            <label className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={ramRgb}
                                                    onChange={(e) => setRamRgb(e.target.checked)}
                                                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                                                />
                                                <span>RGB Heatsink Lighting (+2W)</span>
                                            </label>
                                        </div>

                                        {/* Storage */}
                                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                            <div className="text-xs font-bold text-slate-300">Storage Drives</div>
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-slate-400">M.2 NVMe SSDs (7.5W):</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="5"
                                                        value={nvmeCount}
                                                        onChange={(e) => setNvmeCount(Number(e.target.value))}
                                                        className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-white"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-slate-400">2.5" SATA SSDs (4W):</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="6"
                                                        value={sataSsdCount}
                                                        onChange={(e) => setSataSsdCount(Number(e.target.value))}
                                                        className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-white"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-slate-400">3.5" Mechanical HDDs (11W):</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="4"
                                                        value={hddCount}
                                                        onChange={(e) => setHddCount(Number(e.target.value))}
                                                        className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Case Fans, RGB & Overclocking Toggle */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                <span>Chassis PWM Fans (3.5W each):</span>
                                                <span className="text-cyan-400 font-mono">{caseFanCount} Fans</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="9"
                                                value={caseFanCount}
                                                onChange={(e) => setCaseFanCount(Number(e.target.value))}
                                                className="w-full accent-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                                            <div>
                                                <span className="text-xs font-bold text-slate-200 block">+15% Transient Spike Buffer</span>
                                                <span className="text-[10px] text-slate-400">ATX 3.0 transient spike headroom</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={overclockHeadroom}
                                                onChange={(e) => setOverclockHeadroom(e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Electrical Telemetry & PSU Recommendation (5 Cols) */}
                            <div className="lg:col-span-5 space-y-6">
                                
                                {/* Recommended PSU Capacity Card */}
                                <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-blue-500/40 p-6 shadow-2xl space-y-5 text-slate-100">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                            Calculated PSU Capacity
                                        </span>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
                                            80 PLUS Certified
                                        </span>
                                    </div>

                                    {/* Main Hero Number */}
                                    <div className="text-center py-2 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                                        <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Recommended Minimum PSU</div>
                                        <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 my-1">
                                            {powerCalculations.recommendedPsuWatts} Watts
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Estimated Full Load Peak: <span className="font-bold text-white">{powerCalculations.peakWattsWithHeadroom}W</span>
                                        </div>
                                    </div>

                                    {/* Efficiency Curve Sweet Spot */}
                                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 flex items-center">
                                                <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Efficiency Sweet Spot (50%):
                                            </span>
                                            <span className="font-extrabold text-emerald-400">{powerCalculations.sweetSpotWatts}W</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                            At this load, your PSU operates at peak 90%+ electrical efficiency with zero thermal strain and inaudible fan curves.
                                        </p>
                                    </div>

                                    {/* Rail Amperage Breakdown */}
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                            Dedicated Rail Loadings
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                <span className="text-[9px] uppercase text-amber-400 font-bold block">+12V Single Rail</span>
                                                <span className="text-lg font-black text-white">{powerCalculations.plus12vAmps} A</span>
                                                <span className="text-[10px] text-slate-500 block">({powerCalculations.plus12vWatts}W CPU/GPU)</span>
                                            </div>

                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                <span className="text-[9px] uppercase text-purple-400 font-bold block">+5V & +3.3V Rails</span>
                                                <span className="text-lg font-black text-white">{powerCalculations.minorRailsCombinedAmps} A</span>
                                                <span className="text-[10px] text-slate-500 block">({powerCalculations.minorRailsWatts}W Board/RAM)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Power Consumption Breakdown Bars */}
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                                            Sub-System Power Share
                                        </div>
                                        <div className="space-y-2">
                                            {powerCalculations.breakdown.map((item, idx) => {
                                                const pct = Math.round((item.watts / powerCalculations.rawPeakWatts) * 100);
                                                return (
                                                    <div key={idx} className="space-y-0.5">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="text-slate-300">{item.label}</span>
                                                            <span className={`font-mono font-bold ${item.color}`}>{item.watts}W ({pct}%)</span>
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                            <div className={`h-full ${item.barColor}`} style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Required Cable Harness Summary */}
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                                        <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">
                                            Required PSU Cables for this build:
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>• 24-Pin ATX Main:</span> <span className="text-white font-mono font-bold">1x Cable</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>• 8-Pin (4+4) EPS CPU:</span> 
                                            <span className="text-white font-mono font-bold">
                                                {cpu.boostTdp > 200 ? '2x Cables (Dual 8-Pin)' : '1x Cable'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>• 8-Pin PCIe GPU Power:</span> 
                                            <span className="text-white font-mono font-bold">
                                                {gpu.pcieCables > 0 ? `${gpu.pcieCables}x PCIe Cables` : '0 (Slot powered)'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>• 15-Pin SATA Power:</span> 
                                            <span className="text-white font-mono font-bold">
                                                {sataSsdCount + hddCount > 0 ? `${sataSsdCount + hddCount}x SATA Connectors` : '0 (NVMe Only)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: BOTTLENECK & SYSTEM COMPATIBILITY ANALYZER */}
                    {activeTab === 'bottleneck_analyzer' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left: Bottleneck Meter & Summary (6 Cols) */}
                            <div className="lg:col-span-6 space-y-6">
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center space-x-2 text-blue-400">
                                            <Gauge className="h-5 w-5" />
                                            <h2 className="text-base font-extrabold text-white">Compute Bottleneck Analysis</h2>
                                        </div>

                                        {/* Resolution Target Switcher */}
                                        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                                            {['1080p', '1440p', '4k'].map(res => (
                                                <button
                                                    key={res}
                                                    onClick={() => setResolutionTarget(res)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                                                        resolutionTarget === res
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-slate-400 hover:text-white'
                                                    }`}
                                                >
                                                    {res}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Big Bottleneck Percentage Readout */}
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                                            Estimated {resolutionTarget.toUpperCase()} Bottleneck Ratio
                                        </span>
                                        <div className={`text-5xl font-black ${
                                            compatibilityCheck.bottleneckPct < 15
                                                ? 'text-emerald-400'
                                                : compatibilityCheck.bottleneckPct < 30
                                                ? 'text-amber-400'
                                                : 'text-rose-400'
                                        }`}>
                                            {compatibilityCheck.bottleneckPct}%
                                        </div>
                                        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
                                            {compatibilityCheck.bottleneckPct < 15
                                                ? '✓ Optimal Component Pairing'
                                                : compatibilityCheck.bottleneckType === 'cpu'
                                                ? '⚠️ CPU-Bound Scenario'
                                                : '⚠️ GPU-Bound Scenario'}
                                        </div>
                                        <p className="text-xs text-slate-400 max-w-md mx-auto pt-2 leading-relaxed">
                                            {compatibilityCheck.bottleneckMessage}
                                        </p>
                                    </div>

                                    {/* Relative Compute Comparison */}
                                    <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                        <div className="text-xs font-bold text-slate-300 mb-1">Processing Balance at {resolutionTarget.toUpperCase()}:</div>
                                        
                                        <div>
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Processor ({cpu.name}):</span>
                                                <span className="font-mono text-blue-400 font-bold">{cpu.perfScore} pts</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${cpu.perfScore}%` }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Graphics ({gpu.name}):</span>
                                                <span className="font-mono text-orange-400 font-bold">{gpu.perfScore} pts</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                                <div className="h-full bg-orange-500" style={{ width: `${gpu.perfScore}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Architectural Compatibility Diagnostics (6 Cols) */}
                            <div className="lg:col-span-6 space-y-6">
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center space-x-2 text-emerald-400">
                                            <ShieldCheck className="h-5 w-5" />
                                            <h2 className="text-base font-extrabold text-white">Physical & Architectural Compatibility</h2>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            compatibilityCheck.isCriticalMismatch
                                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {compatibilityCheck.isCriticalMismatch ? 'Issues Detected' : 'All Clear'}
                                        </span>
                                    </div>

                                    {/* List of compatibility check items */}
                                    <div className="space-y-3">
                                        {compatibilityCheck.issues.map((issue, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                                                    issue.type === 'error'
                                                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                                                        : issue.type === 'warning'
                                                        ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                                                        : 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {issue.type === 'error' ? (
                                                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                                                    ) : issue.type === 'warning' ? (
                                                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-extrabold tracking-wide mb-0.5">{issue.title}</div>
                                                    <div className="text-[11px] opacity-90 leading-relaxed">{issue.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PCIe Lane & Bandwidth Explanation Box */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                                        <div className="font-bold text-white flex items-center">
                                            <Info className="h-4 w-4 mr-1.5 text-blue-400" /> PCIe Bus Lane Distribution:
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Your selected {cpu.name} provides 16 direct PCIe 5.0 lanes for the primary graphics card and 4 dedicated PCIe 4.0 lanes for the primary M.2 NVMe SSD. Secondary M.2 drives and SATA ports communicate via the {mb.name} chipset bus.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
