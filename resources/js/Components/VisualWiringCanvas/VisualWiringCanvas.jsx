import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
    Zap, Play, Power, RotateCcw, ShieldCheck, Thermometer,
    CheckCircle2, AlertTriangle, Activity, Terminal, Eye,
    Maximize2, HelpCircle, Layers, FileText, Send, Sparkles, PlusCircle
} from 'lucide-react';

import { 
    PSUNode, 
    MotherboardNode, 
    GPUNode, 
    SSDNode, 
    FrontPanelNode, 
    CoolerNode 
} from './CustomHardwareNodes';

import { 
    validateHardwareConnection, 
    CABLE_TYPES, 
    VALID_CONNECTIONS 
} from '../../Utils/hardwareWiringRules';

import { 
    evaluateHardwareSimulation, 
    PIN_VOLTAGE_LOOKUP 
} from '../../Utils/hardwareSimulationEngine';

// Default Blueprint Nodes Positions (Standard PC Mid-Tower Chassis Layout)
const DEFAULT_PRESET_NODES = [
    {
        id: 'node_psu',
        type: 'psuNode',
        position: { x: 40, y: 340 },
        data: { label: 'Modular PSU', category: 'power' }
    },
    {
        id: 'node_cooler',
        type: 'coolerNode',
        position: { x: 400, y: 20 },
        data: { label: 'CPU Cooler', category: 'cooling' }
    },
    {
        id: 'node_motherboard',
        type: 'motherboardNode',
        position: { x: 370, y: 160 },
        data: { label: 'Motherboard', category: 'motherboard' }
    },
    {
        id: 'node_front_panel',
        type: 'frontPanelNode',
        position: { x: 770, y: 30 },
        data: { label: 'Front Panel', category: 'chassis' }
    },
    {
        id: 'node_ssd',
        type: 'ssdNode',
        position: { x: 770, y: 240 },
        data: { label: 'SATA SSD', category: 'storage' }
    },
    {
        id: 'node_gpu',
        type: 'gpuNode',
        position: { x: 770, y: 440 },
        data: { label: 'Graphics Card', category: 'expansion' }
    }
];

export default function VisualWiringCanvas({
    initialNodes = null,
    initialEdges = null,
    onSave = null,
    onSubmit = null,
    isPracticeMode = false,
    readOnly = false
}) {
    // 1. ReactFlow State
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || DEFAULT_PRESET_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

    // 2. Workbench & Tool Modes
    const [toolMode, setToolMode] = useState('wiring'); // 'wiring' | 'multimeter' | 'thermal'
    const [isPsuSwitchOn, setIsPsuSwitchOn] = useState(true);
    const [isAcPlugged, setIsAcPlugged] = useState(true);
    const [isChassisPwrPressed, setIsChassisPwrPressed] = useState(false);
    const [isPpeEquipped, setIsPpeEquipped] = useState(true);
    const [isEsdGroundVerified, setIsEsdGroundVerified] = useState(true);

    // Multimeter Probe State
    const [probedTerminal, setProbedTerminal] = useState(null);

    // Logs Console State
    const [logs, setLogs] = useState([
        { id: 1, type: 'info', text: 'Visual Wiring Canvas initialized. Ready for cable routing.', time: new Date().toLocaleTimeString() }
    ]);

    // Submission & Checklist Modals
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

    // Add log entry
    const addLog = useCallback((type, text) => {
        setLogs(prev => [
            { id: Date.now() + Math.random(), type, text, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 49)
        ]);
    }, []);

    // 3. Register Custom ReactFlow Node Types
    const nodeTypes = useMemo(() => ({
        psuNode: PSUNode,
        motherboardNode: MotherboardNode,
        gpuNode: GPUNode,
        ssdNode: SSDNode,
        frontPanelNode: FrontPanelNode,
        coolerNode: CoolerNode
    }), []);

    // 4. Run Live Simulation Evaluation
    const simResult = useMemo(() => {
        return evaluateHardwareSimulation(nodes, edges, {
            isAcPlugged,
            isPsuSwitchOn,
            isChassisPwrPressed,
            isPpeEquipped,
            isEsdGroundVerified
        });
    }, [nodes, edges, isAcPlugged, isPsuSwitchOn, isChassisPwrPressed, isPpeEquipped, isEsdGroundVerified]);

    // Update node data reactively with live simulation telemetry
    useEffect(() => {
        setNodes(nds => nds.map(node => ({
            ...node,
            data: {
                ...node.data,
                isPsuEnergized: simResult.isPsuEnergized,
                isStandbyActive: simResult.isStandbyActive,
                isSystemRunning: simResult.isSystemRunning,
                postStatus: simResult.postStatus,
                postHexCode: simResult.postHexCode,
                postLedArray: simResult.postLedArray,
                thermals: simResult.thermals,
                fanRpm: simResult.fanRpm,
                isThermalMode: toolMode === 'thermal'
            }
        })));
    }, [simResult, toolMode, setNodes]);

    // 5. Cable Connection Event Handler
    const onConnect = useCallback((connection) => {
        if (readOnly) return;

        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        const validation = validateHardwareConnection(
            connection.sourceHandle,
            connection.targetHandle,
            sourceNode,
            targetNode
        );

        if (!validation.allowed) {
            addLog('error', `Connection Rejected: ${validation.message}`);
            alert(`⚠️ Connection Error:\n${validation.message}`);
            return;
        }

        const cable = validation.cableInfo;
        const newEdge = {
            ...connection,
            id: `edge_${connection.sourceHandle}_${connection.targetHandle}`,
            animated: simResult.isSystemRunning,
            style: {
                stroke: cable.color,
                strokeWidth: cable.strokeWidth,
                strokeDasharray: simResult.isSystemRunning ? '5,5' : 'none'
            },
            data: {
                cableType: cable.id,
                name: validation.connectionName,
                critical: validation.critical
            }
        };

        setEdges((eds) => addEdge(newEdge, eds));
        addLog('success', `Cabled: ${validation.connectionName} seated securely.`);
    }, [nodes, readOnly, simResult.isSystemRunning, addLog, setEdges]);

    // 6. Handle Multimeter Probe Clicking
    const handleNodeClick = useCallback((event, node) => {
        if (toolMode !== 'multimeter') return;

        // Try to identify which handle was clicked from target element
        const handleElement = event.target.closest('.react-flow__handle');
        const handleId = handleElement ? handleElement.getAttribute('data-handleid') : null;

        if (handleId && PIN_VOLTAGE_LOOKUP[handleId]) {
            const pinInfo = PIN_VOLTAGE_LOOKUP[handleId];
            setProbedTerminal({
                nodeName: node.data.label,
                handleId,
                ...pinInfo,
                liveVoltage: simResult.isSystemRunning ? pinInfo.voltage : (simResult.isStandbyActive && handleId.includes('atx24') ? 5.05 : 0.0)
            });
            addLog('info', `DMM Probe connected to ${handleId} on ${node.data.label}. Reading: ${pinInfo.voltage}V.`);
        } else {
            // General node body probed
            setProbedTerminal({
                nodeName: node.data.label,
                handleId: 'Chassis / Ground Plane',
                rail: 'Chassis Earth Ground',
                voltage: 0.0,
                liveVoltage: 0.0,
                spec: '0.0V DC Ground plane with <0.1Ω continuity',
                tolerance: 'GND'
            });
        }
    }, [toolMode, simResult, addLog]);

    // 7. Power Switch Toggle Actions
    const handleTogglePsu = () => {
        const nextState = !isPsuSwitchOn;
        setIsPsuSwitchOn(nextState);
        addLog('info', `PSU Rocker Switch flipped to ${nextState ? 'ON (I)' : 'OFF (O)'}.`);
    };

    const handlePressChassisPower = () => {
        if (!isPsuSwitchOn || !isAcPlugged) {
            addLog('error', 'Chassis Power Button pressed, but AC mains switch is off! Zero power.');
            return;
        }

        const nextRunning = !isChassisPwrPressed;
        setIsChassisPwrPressed(nextRunning);
        if (nextRunning) {
            addLog('info', 'Front Panel Power Switch pulsed (Pins 6 & 8 shorted). Initiating POST boot sequence...');
        } else {
            addLog('info', 'System shut down via Front Panel Power Switch.');
        }
    };

    // 8. Reset / Clear Canvas
    const handleResetCanvas = () => {
        if (!confirm('Are you sure you want to clear all connected cables and reset the canvas?')) return;
        setEdges([]);
        setIsChassisPwrPressed(false);
        setProbedTerminal(null);
        addLog('info', 'All cable harnesses disconnected. Workbench cleared.');
    };

    const handleLoadBlueprint = () => {
        if (!confirm('Reset components to standard mid-tower chassis positions?')) return;
        setNodes(DEFAULT_PRESET_NODES);
        setEdges([]);
        setIsChassisPwrPressed(false);
        addLog('info', 'Chassis blueprint layout reloaded.');
    };

    // 9. Save & Submit
    const handleSaveWorkspace = () => {
        if (onSave) {
            onSave({
                nodes,
                edges,
                score: simResult.score,
                checklist: simResult.checklist
            });
        }
        addLog('success', 'Visual wiring workspace saved successfully.');
    };

    const handleSubmitForGrading = (e) => {
        e?.preventDefault();
        if (onSubmit) {
            onSubmit({
                nodes,
                edges,
                score: simResult.score,
                checklist: simResult.checklist,
                postStatus: simResult.postStatus,
                isPpeEquipped,
                isEsdGroundVerified
            });
        }
        setIsSubmitModalOpen(false);
    };

    return (
        <div className="relative w-full h-[760px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col font-sans select-none shadow-2xl">
            {/* Top Toolbar / HUD */}
            <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-10">
                {/* Left: Platform & Simulator Title */}
                <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-sm font-extrabold text-white tracking-wide">
                                Interactive Visual Wiring Canvas
                            </h2>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                ReactFlow v12
                            </span>
                            {isPracticeMode && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Practice Mode
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                            PSU Modular Harnesses • 24-Pin ATX • EPS 8-Pin • PCIe Aux • F_PANEL
                        </p>
                    </div>
                </div>

                {/* Center: Tool Mode Switcher */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setToolMode('wiring')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            toolMode === 'wiring'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="Cable Routing Mode: drag terminals to connect wires"
                    >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Wiring Mode</span>
                    </button>

                    <button
                        onClick={() => setToolMode('multimeter')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            toolMode === 'multimeter'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="DMM Probe Mode: click any terminal to read live voltage"
                    >
                        <Activity className="h-3.5 w-3.5" />
                        <span>Multimeter Probe</span>
                    </button>

                    <button
                        onClick={() => setToolMode('thermal')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            toolMode === 'thermal'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="Thermal Vision: inspect VRM and CPU thermal heatmaps"
                    >
                        <Thermometer className="h-3.5 w-3.5" />
                        <span>Thermal Vision</span>
                    </button>
                </div>

                {/* Right: Power & Action Controls */}
                <div className="flex items-center space-x-2.5">
                    {/* PSU Rocker Switch */}
                    <button
                        onClick={handleTogglePsu}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            isPsuSwitchOn
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900'
                                : 'bg-rose-950/80 text-rose-400 border-rose-500/40 hover:bg-rose-900'
                        }`}
                        title="PSU Master Rocker Switch (I/O)"
                    >
                        <Power className="h-3.5 w-3.5" />
                        <span>PSU: {isPsuSwitchOn ? 'ON (I)' : 'OFF (O)'}</span>
                    </button>

                    {/* Chassis Power Button */}
                    <button
                        onClick={handlePressChassisPower}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition ${
                            isChassisPwrPressed
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="Push Case Power Switch (PWR_SW)"
                    >
                        <Play className={`h-3.5 w-3.5 ${isChassisPwrPressed ? 'animate-pulse' : ''}`} />
                        <span>{isChassisPwrPressed ? 'PC Running' : 'Press Power'}</span>
                    </button>

                    <div className="h-6 w-px bg-slate-800 mx-1"></div>

                    {/* Reset Layout */}
                    <button
                        onClick={handleLoadBlueprint}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Reload Chassis Blueprint"
                    >
                        <Layers className="h-4 w-4" />
                    </button>

                    {/* Clear Cables */}
                    <button
                        onClick={handleResetCanvas}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition"
                        title="Clear all connected cables"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* Submit for Grading */}
                    {!readOnly && (
                        <button
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/20 transition"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Submit Wiring</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="flex-1 relative flex">
                {/* ReactFlow Canvas */}
                <div className="flex-1 h-full bg-slate-950">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={readOnly ? undefined : onNodesChange}
                        onEdgesChange={readOnly ? undefined : onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-left"
                        className="bg-slate-950"
                    >
                        <Background color="#334155" gap={24} size={1} />
                        <Controls className="!bg-slate-900 !border-slate-800 !text-white [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!fill-white" />
                        <MiniMap 
                            nodeStrokeWidth={3}
                            nodeColor={(n) => {
                                if (n.type === 'psuNode') return '#f59e0b';
                                if (n.type === 'motherboardNode') return '#3b82f6';
                                if (n.type === 'gpuNode') return '#f97316';
                                if (n.type === 'ssdNode') return '#10b981';
                                return '#64748b';
                            }}
                            className="!bg-slate-900 !border-slate-800 rounded-xl overflow-hidden" 
                        />
                    </ReactFlow>
                </div>

                {/* Floating Multimeter Display (When Multimeter Mode is Active or Probed) */}
                {toolMode === 'multimeter' && (
                    <div className="absolute top-4 left-4 z-20 w-72 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-500/40 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                            <div className="flex items-center space-x-2 text-amber-400">
                                <Activity className="h-4 w-4" />
                                <span className="text-xs font-extrabold uppercase tracking-wider">Digital Multimeter</span>
                            </div>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">DC Volts</span>
                        </div>

                        {probedTerminal ? (
                            <div className="space-y-2">
                                <div className="bg-black p-3 rounded-xl border border-slate-800 text-center font-mono">
                                    <span className="text-[10px] text-slate-500 block uppercase">Measured Potential:</span>
                                    <span className="text-2xl font-black text-amber-400 tracking-wider">
                                        {probedTerminal.liveVoltage.toFixed(2)} V
                                    </span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">{probedTerminal.rail}</span>
                                </div>
                                <div className="text-[10px] space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                                    <div><span className="text-slate-500">Component:</span> <span className="font-bold text-white">{probedTerminal.nodeName}</span></div>
                                    <div><span className="text-slate-500">Terminal:</span> <span className="font-mono text-cyan-300">{probedTerminal.handleId}</span></div>
                                    <div><span className="text-slate-500">Standard Spec:</span> <span className="text-slate-300">{probedTerminal.spec}</span></div>
                                    <div><span className="text-slate-500">ATX Window:</span> <span className="text-emerald-400 font-mono">{probedTerminal.tolerance}</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-xs text-slate-400 space-y-2">
                                <div className="p-2 rounded-full bg-slate-800/60 inline-block text-amber-400">
                                    <Zap className="h-5 w-5 mx-auto" />
                                </div>
                                <p className="text-[11px] leading-tight">
                                    Click any component terminal or connector pin to read live voltage rails.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Right Drawer: Live Diagnostics, Telemetry, and Checklist */}
                <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-10 shadow-2xl">
                    {/* Header: Score & POST Summary */}
                    <div className="p-4 border-b border-slate-800 bg-slate-950/40">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                Auto-Grading Diagnostic
                            </span>
                            <div className="flex items-center space-x-1">
                                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                                <span className="text-sm font-black text-white">{simResult.score}%</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    simResult.score >= 80 ? 'bg-emerald-500' : simResult.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${simResult.score}%` }}
                            ></div>
                        </div>

                        {/* POST Status Alert Box */}
                        <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                            simResult.postStatus === 'SUCCESS'
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                : simResult.postStatus === 'STANDBY'
                                ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        }`}>
                            <div className="font-extrabold flex items-center mb-0.5">
                                {simResult.postStatus === 'SUCCESS' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1 text-rose-400" />
                                )}
                                Status: {simResult.postStatus}
                            </div>
                            <div className="text-[10px] opacity-90">{simResult.postMessage}</div>
                        </div>
                    </div>

                    {/* Diagnostic Checklist Tabs */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                            Cabling Verification Checklist
                        </div>

                        {simResult.checklist.map((item) => (
                            <div 
                                key={item.id}
                                className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 transition ${
                                    item.status === 'pass'
                                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                                        : item.status === 'warn'
                                        ? 'bg-amber-950/20 border-amber-800/40 text-slate-200'
                                        : 'bg-rose-950/20 border-rose-800/40 text-slate-300'
                                }`}
                            >
                                <div className="mt-0.5">
                                    {item.status === 'pass' ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    ) : item.status === 'warn' ? (
                                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border border-rose-500 flex items-center justify-center text-rose-400 text-[10px] font-bold">✕</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold">{item.label}</div>
                                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.details}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom: Event Terminal Logs */}
                    <div className="h-44 border-t border-slate-800 bg-slate-950 p-3 flex flex-col font-mono text-[10px]">
                        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1 mb-1">
                            <span className="flex items-center text-[9px] uppercase tracking-wider font-extrabold">
                                <Terminal className="h-3 w-3 mr-1 text-blue-400" /> System Event Log
                            </span>
                            <span className="text-[8px] text-slate-500">{logs.length} events</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                            {logs.map(log => (
                                <div key={log.id} className="leading-tight">
                                    <span className="text-slate-600">[{log.time}]</span>{' '}
                                    <span className={
                                        log.type === 'success' ? 'text-emerald-400' :
                                        log.type === 'error' ? 'text-rose-400' :
                                        'text-cyan-400'
                                    }>
                                        {log.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission & Commissioning Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                                <h3 className="text-base font-bold text-white">Submit Lab Wiring for Grading</h3>
                            </div>
                            <button
                                onClick={() => setIsSubmitModalOpen(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForGrading} className="space-y-4 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total Score Earned:</span>
                                    <span className="text-base font-extrabold text-blue-400">{simResult.score}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">POST Result:</span>
                                    <span className={`font-bold ${simResult.postStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {simResult.postStatus} (Code {simResult.postHexCode})
                                    </span>
                                </div>
                            </div>

                            {/* Commissioning & ESD Verification Checkboxes */}
                            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <span className="font-extrabold text-slate-300 uppercase tracking-widest text-[9px] block">
                                    Safety & ESD Compliance Verification
                                </span>

                                <label className="flex items-start space-x-2.5 cursor-pointer py-1">
                                    <input
                                        type="checkbox"
                                        checked={isEsdGroundVerified}
                                        onChange={(e) => setIsEsdGroundVerified(e.target.checked)}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                                    />
                                    <span className="text-slate-300 leading-tight">
                                        I wore an anti-static ESD wrist strap securely grounded to bare unpainted chassis metal throughout component cabling.
                                    </span>
                                </label>

                                <label className="flex items-start space-x-2.5 cursor-pointer py-1">
                                    <input
                                        type="checkbox"
                                        checked={isPpeEquipped}
                                        onChange={(e) => setIsPpeEquipped(e.target.checked)}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                                    />
                                    <span className="text-slate-300 leading-tight">
                                        I verified all locking retention clips (ATX 24P latch, EPS 8P clip, PCIe 8P latch) clicked firmly into place with zero pin strain.
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-blue-500/25"
                                >
                                    Confirm Submission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
