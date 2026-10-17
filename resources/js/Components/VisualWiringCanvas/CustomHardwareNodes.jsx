import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    Zap, Activity, Cpu, HardDrive, Monitor, Fan, Power, 
    Thermometer, CheckCircle2, AlertTriangle, ShieldCheck 
} from 'lucide-react';

/**
 * 1. Modular Power Supply Unit (PSU) Node
 */
export const PSUNode = ({ data, id }) => {
    const isEnergized = data.isPsuEnergized;
    const isThermal = data.isThermalMode;
    const temp = data.thermals?.psu || 25;

    // Thermal gradient color
    const thermalBg = isThermal 
        ? temp > 40 ? 'bg-orange-950/80 border-orange-500' : 'bg-blue-950/80 border-blue-500'
        : 'bg-slate-900 border-slate-700';

    return (
        <div className={`w-64 rounded-2xl border-2 shadow-2xl p-4 transition-all text-slate-100 ${thermalBg} ${isEnergized ? 'shadow-blue-500/10' : 'opacity-85'}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${isEnergized ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Zap className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">Power Delivery</div>
                        <div className="text-xs font-bold text-white">750W Modular PSU</div>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isEnergized ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {isEnergized ? 'AC Active' : 'AC Off'}
                </div>
            </div>

            {/* Visual Specs / Rocker */}
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 mb-3">
                <div>
                    <span className="text-slate-400 block text-[8px] uppercase">Efficiency</span>
                    <span className="font-bold text-slate-200">80+ Gold</span>
                </div>
                <div>
                    <span className="text-slate-400 block text-[8px] uppercase">+12V Rail</span>
                    <span className="font-bold text-amber-400">62.5A (750W)</span>
                </div>
            </div>

            {/* Thermal readout if in thermal mode */}
            {isThermal && (
                <div className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded-lg border border-amber-500/30 mb-3 text-amber-300">
                    <span className="flex items-center"><Thermometer className="h-3 w-3 mr-1" /> PSU Core:</span>
                    <span className="font-bold">{temp}°C</span>
                </div>
            )}

            {/* Modular Output Sockets */}
            <div className="space-y-2.5">
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Modular Ports:</div>

                {/* 1. ATX 24P */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-sky-500/50 transition">
                    <span className="text-[10px] font-semibold text-sky-300 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-sky-400 mr-2"></span>
                        ATX 24-Pin Harness
                    </span>
                    <span className="text-[8px] text-slate-400">Main Rails</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="psu_out_atx24"
                        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>

                {/* 2. EPS 8P */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 transition">
                    <span className="text-[10px] font-semibold text-amber-300 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-amber-400 mr-2"></span>
                        EPS 8-Pin CPU (4+4)
                    </span>
                    <span className="text-[8px] text-slate-400">+12V 336W</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="psu_out_eps8"
                        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>

                {/* 3. PCIe 8P */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-orange-500/50 transition">
                    <span className="text-[10px] font-semibold text-orange-300 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-400 mr-2"></span>
                        PCIe 8-Pin GPU (6+2)
                    </span>
                    <span className="text-[8px] text-slate-400">+12V 150W</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="psu_out_pcie8"
                        className="!w-3 !h-3 !bg-orange-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>

                {/* 4. SATA Power */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-500/50 transition">
                    <span className="text-[10px] font-semibold text-slate-300 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-slate-400 mr-2"></span>
                        SATA 15-Pin Power
                    </span>
                    <span className="text-[8px] text-slate-400">5V/12V Bus</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="psu_out_sata"
                        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * 2. ATX Motherboard Node
 */
export const MotherboardNode = ({ data, id }) => {
    const isThermal = data.isThermalMode;
    const isRunning = data.isSystemRunning;
    const vrmTemp = data.thermals?.vrm || 26;
    const cpuTemp = data.thermals?.cpu || 26;
    const postHex = data.postHexCode || '--';
    const leds = data.postLedArray || { cpu: 'off', dram: 'off', vga: 'off', boot: 'off' };

    // Thermal styling
    const thermalBg = isThermal
        ? cpuTemp > 85 ? 'bg-red-950/90 border-red-500 animate-pulse' : 'bg-blue-950/80 border-blue-500'
        : 'bg-slate-900 border-slate-700';

    const getLedColor = (status) => {
        if (status === 'red') return 'bg-rose-500 shadow-rose-500/50 animate-pulse';
        if (status === 'amber') return 'bg-amber-400 shadow-amber-400/50 animate-pulse';
        if (status === 'green') return 'bg-emerald-400 shadow-emerald-400/50';
        return 'bg-slate-700 opacity-40';
    };

    return (
        <div className={`w-80 rounded-2xl border-2 shadow-2xl p-4 transition-all text-slate-100 ${thermalBg}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400">Motherboard</div>
                        <div className="text-xs font-bold text-white">Intel B760 Gaming ATX</div>
                    </div>
                </div>

                {/* 7-Segment Hex Display */}
                <div className="flex items-center space-x-1.5 bg-black px-2.5 py-1 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-500 uppercase font-mono">POST:</span>
                    <span className="font-mono text-xs font-extrabold text-red-500 tracking-wider">
                        {postHex}
                    </span>
                </div>
            </div>

            {/* 4-Stage Debug LEDs */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                    <span>Q-LED Diagnostics Array</span>
                    <span className="text-[7px] text-slate-500">Live Stage</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <div className={`h-2.5 w-2.5 rounded-full mx-auto mb-1 transition-all ${getLedColor(leds.cpu)}`}></div>
                        <span className="text-[8px] font-bold text-slate-300">CPU</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <div className={`h-2.5 w-2.5 rounded-full mx-auto mb-1 transition-all ${getLedColor(leds.dram)}`}></div>
                        <span className="text-[8px] font-bold text-slate-300">DRAM</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <div className={`h-2.5 w-2.5 rounded-full mx-auto mb-1 transition-all ${getLedColor(leds.vga)}`}></div>
                        <span className="text-[8px] font-bold text-slate-300">VGA</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <div className={`h-2.5 w-2.5 rounded-full mx-auto mb-1 transition-all ${getLedColor(leds.boot)}`}></div>
                        <span className="text-[8px] font-bold text-slate-300">BOOT</span>
                    </div>
                </div>
            </div>

            {/* Thermal Readout */}
            {isThermal && (
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800 mb-3">
                    <div className="flex items-center justify-between text-blue-300">
                        <span>CPU Core:</span>
                        <span className={`font-bold ${cpuTemp > 85 ? 'text-red-400 font-extrabold animate-pulse' : 'text-slate-200'}`}>{cpuTemp}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-300">
                        <span>VRM MOSFET:</span>
                        <span className="font-bold text-slate-200">{vrmTemp}°C</span>
                    </div>
                </div>
            )}

            {/* Motherboard Headers & Ports */}
            <div className="space-y-2">
                {/* 1. ATX 24-Pin Socket */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-sky-500/50 transition">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="mb_in_atx24"
                        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-slate-900 shadow-md"
                    />
                    <span className="text-[10px] font-semibold text-sky-300 pl-2">ATX 24-Pin Main Socket</span>
                    <span className="text-[8px] text-slate-500">Board Power</span>
                </div>

                {/* 2. EPS 8-Pin CPU 12V */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 transition">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="mb_in_eps8"
                        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-900 shadow-md"
                    />
                    <span className="text-[10px] font-semibold text-amber-300 pl-2">EPS 8-Pin CPU 12V Socket</span>
                    <span className="text-[8px] text-slate-500">VRM Supply</span>
                </div>

                {/* 3. CPU_FAN 4-Pin PWM */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-purple-500/50 transition">
                    <span className="text-[10px] font-semibold text-purple-300 pr-2">CPU_FAN 4-Pin Header</span>
                    <span className="text-[8px] text-slate-500">PWM Control</span>
                    <Handle
                        type="target"
                        position={Position.Right}
                        id="mb_cpu_fan_hdr"
                        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>

                {/* 4. SATA Data Port */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 transition">
                    <span className="text-[10px] font-semibold text-rose-300 pr-2">SATA 6Gb/s Port (SATA_1)</span>
                    <span className="text-[8px] text-slate-500">Storage Bus</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="mb_out_sata_data"
                        className="!w-3 !h-3 !bg-rose-400 !border-2 !border-slate-900 shadow-md"
                    />
                </div>

                {/* 5. Front Panel Header Cluster */}
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center">
                        <Activity className="h-3 w-3 mr-1" /> F_PANEL Jumper Cluster
                    </div>
                    
                    <div className="relative flex items-center justify-between py-0.5">
                        <span className="text-[9px] text-emerald-300">PWR_SW (Pins 6 & 8)</span>
                        <Handle
                            type="target"
                            position={Position.Right}
                            id="mb_fpanel_pwr_sw"
                            className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
                        />
                    </div>
                    
                    <div className="relative flex items-center justify-between py-0.5">
                        <span className="text-[9px] text-cyan-300">RESET_SW (Pins 5 & 7)</span>
                        <Handle
                            type="target"
                            position={Position.Right}
                            id="mb_fpanel_reset_sw"
                            className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
                        />
                    </div>

                    <div className="relative flex items-center justify-between py-0.5">
                        <span className="text-[9px] text-yellow-300">HDD_LED (Pins 1 & 3)</span>
                        <Handle
                            type="target"
                            position={Position.Right}
                            id="mb_fpanel_hdd_led"
                            className="!w-2.5 !h-2.5 !bg-yellow-400 !border-2 !border-slate-900"
                        />
                    </div>

                    <div className="relative flex items-center justify-between py-0.5">
                        <span className="text-[9px] text-green-300">PWR_LED (Pins 2 & 4)</span>
                        <Handle
                            type="target"
                            position={Position.Right}
                            id="mb_fpanel_pwr_led"
                            className="!w-2.5 !h-2.5 !bg-green-400 !border-2 !border-slate-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * 3. Discrete Graphics Card (GPU) Node
 */
export const GPUNode = ({ data, id }) => {
    const isThermal = data.isThermalMode;
    const temp = data.thermals?.gpu || 25;
    const isRunning = data.isSystemRunning;

    const thermalBg = isThermal
        ? temp > 70 ? 'bg-orange-950/90 border-orange-500' : 'bg-blue-950/80 border-blue-500'
        : 'bg-slate-900 border-slate-700';

    return (
        <div className={`w-64 rounded-2xl border-2 shadow-2xl p-4 transition-all text-slate-100 ${thermalBg}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                        <Monitor className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-orange-400">Graphics Card</div>
                        <div className="text-xs font-bold text-white">NVIDIA RTX 4070 12GB</div>
                    </div>
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">PCIe x16</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 mb-3">
                <div>
                    <span className="text-slate-400 block text-[8px] uppercase">Slot Power</span>
                    <span className="font-bold text-slate-200">75W (Base)</span>
                </div>
                <div>
                    <span className="text-slate-400 block text-[8px] uppercase">Auxiliary Need</span>
                    <span className="font-bold text-orange-400">150W (8-Pin)</span>
                </div>
            </div>

            {isThermal && (
                <div className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded-lg border border-orange-500/30 mb-3 text-orange-300">
                    <span className="flex items-center"><Thermometer className="h-3 w-3 mr-1" /> GPU Core:</span>
                    <span className="font-bold">{temp}°C</span>
                </div>
            )}

            {/* Auxiliary 8-Pin Input */}
            <div className="relative flex items-center justify-between bg-slate-950/80 px-2.5 py-2 rounded-lg border border-slate-800 hover:border-orange-500/50 transition">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="gpu_in_pcie8"
                    className="!w-3 !h-3 !bg-orange-400 !border-2 !border-slate-900 shadow-md"
                />
                <span className="text-[10px] font-semibold text-orange-300 pl-2">PCIe 8-Pin Auxiliary Power</span>
                <span className="text-[8px] text-slate-500">+12V Aux</span>
            </div>
        </div>
    );
};

/**
 * 4. SATA SSD Storage Drive Node
 */
export const SSDNode = ({ data, id }) => {
    return (
        <div className="w-56 rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl p-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <HardDrive className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">SATA Storage</div>
                        <div className="text-xs font-bold text-white">1TB 2.5" Solid State Drive</div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {/* 1. SATA 15P Power */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="ssd_in_power"
                        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900 shadow-md"
                    />
                    <span className="text-[10px] font-semibold text-slate-300 pl-2">15-Pin SATA Power</span>
                    <span className="text-[8px] text-slate-500">+5V DC</span>
                </div>

                {/* 2. SATA 7P Data */}
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="ssd_in_data"
                        className="!w-3 !h-3 !bg-rose-400 !border-2 !border-slate-900 shadow-md"
                    />
                    <span className="text-[10px] font-semibold text-rose-300 pl-2">7-Pin SATA Data</span>
                    <span className="text-[8px] text-slate-500">6Gb/s Bus</span>
                </div>
            </div>
        </div>
    );
};

/**
 * 5. Chassis Front Panel Module Node
 */
export const FrontPanelNode = ({ data, id }) => {
    return (
        <div className="w-60 rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl p-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                        <Power className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-teal-400">Chassis Front I/O</div>
                        <div className="text-xs font-bold text-white">Case Switch Harness</div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-emerald-300">PWR_SW Cable</span>
                    <span className="text-[8px] text-slate-500">Pins 6 & 8</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="fp_pwr_sw_out"
                        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
                    />
                </div>

                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-cyan-300">RESET_SW Cable</span>
                    <span className="text-[8px] text-slate-500">Pins 5 & 7</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="fp_reset_sw_out"
                        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
                    />
                </div>

                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-yellow-300">HDD_LED (+/-)</span>
                    <span className="text-[8px] text-slate-500">Pins 1 & 3</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="fp_hdd_led_out"
                        className="!w-2.5 !h-2.5 !bg-yellow-400 !border-2 !border-slate-900"
                    />
                </div>

                <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-green-300">PWR_LED (+/-)</span>
                    <span className="text-[8px] text-slate-500">Pins 2 & 4</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="fp_pwr_led_out"
                        className="!w-2.5 !h-2.5 !bg-green-400 !border-2 !border-slate-900"
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * 6. CPU Cooler Fan Node
 */
export const CoolerNode = ({ data, id }) => {
    const isRunning = data.isSystemRunning && data.fanRpm > 0;

    return (
        <div className="w-56 rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl p-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <Fan className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400">CPU Cooling</div>
                        <div className="text-xs font-bold text-white">120mm PWM Fan</div>
                    </div>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {isRunning ? `${data.fanRpm} RPM` : 'Stopped'}
                </span>
            </div>

            <div className="relative flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-semibold text-purple-300">4-Pin PWM Fan Lead</span>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="fan_pwm_out"
                    className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-900 shadow-md"
                />
            </div>
        </div>
    );
};
