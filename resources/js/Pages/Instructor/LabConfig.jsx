import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function LabConfig({ lab }) {
    const [questions, setQuestions] = useState(lab.component_questions || lab.componentQuestions || []);
    const [hotspots, setHotspots] = useState(lab.hotspot_questions || lab.hotspotQuestions || []);
    const [steps, setSteps] = useState(lab.assembly_steps || lab.assemblySteps || []);
    const [scenarios, setScenarios] = useState(lab.troubleshooting_scenarios || lab.troubleshootingScenarios || []);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedAssetUrl, setSelectedAssetUrl] = useState(lab.assets[0]?.file_path || '');
    
    const motherboardImageRef = useRef(null);

    const form = useForm({
        questions: [],
        hotspots: [],
        steps: [],
        scenarios: []
    });

    const handleSave = () => {
        setIsSaving(true);
        const payload = {};
        if (lab.type === 'component_id') payload.questions = questions;
        if (lab.type === 'motherboard_hotspot') payload.hotspots = hotspots;
        if (lab.type === 'assembly_sequence' || lab.type === 'drag_drop_build' || lab.type === 'preventive_maintenance') payload.steps = steps;
        if (lab.type === 'troubleshooting') payload.scenarios = scenarios;

        form.setData(payload);
        
        form.transform((data) => ({
            ...data,
            ...payload
        })).post(route('instructor.labs.config', lab.id), {
            onFinish: () => setIsSaving(false),
            onSuccess: () => alert('Configuration saved successfully!')
        });
    };

    const handleImageUpload = (e, callback) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('asset_type', lab.type === 'motherboard_hotspot' ? 'background' : 'component');

        axios.post(route('instructor.labs.upload-asset', lab.id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            const assetUrl = response.data.asset.file_path;
            if (lab.type === 'motherboard_hotspot') {
                setSelectedAssetUrl(assetUrl);
            }
            if (callback) callback(assetUrl);
            alert('File uploaded successfully!');
        })
        .catch(err => {
            console.error(err);
            alert('Failed to upload image.');
        })
        .finally(() => {
            setUploading(false);
        });
    };

    const handleMotherboardClick = (e) => {
        if (!motherboardImageRef.current) return;
        const rect = motherboardImageRef.current.getBoundingClientRect();
        
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newLabel = prompt('Enter a label for this hotspot (e.g. CPU Socket, CMOS Battery, M.2 Slot):');
        if (!newLabel) return;

        setHotspots([...hotspots, {
            label: newLabel,
            x_coord: Math.round(x * 10) / 10,
            y_coord: Math.round(y * 10) / 10,
            radius: 5
        }]);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Configure Simulator: {lab.title}
                        </h2>
                        <p className="text-xs text-blue-400 mt-1 uppercase font-mono tracking-wider font-bold">
                            Workstation Type: {lab.type.replace(/_/g, ' ')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('instructor.labs.index')}
                            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition"
                        >
                            &larr; Labs Directory
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                        >
                            {isSaving ? 'Saving Configuration...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Config - ${lab.title}`} />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Component Identification Configuration */}
                    {lab.type === 'component_id' && (
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white">Component Questions</h3>
                                        <p className="text-xs text-slate-400">Configure visual component recognition cards, distractors, and functional definitions.</p>
                                    </div>
                                    <button
                                        onClick={() => setQuestions([...questions, {
                                            correct_name: '',
                                            correct_function: '',
                                            options: [],
                                            function_options: [],
                                            image_path: ''
                                        }])}
                                        className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition"
                                    >
                                        + Add Component Question
                                    </button>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <span className="text-3xl block mb-2">🧩</span>
                                        <p className="font-semibold text-sm text-slate-300">No component questions added yet.</p>
                                        <p className="text-xs text-slate-500 mt-1">Click "+ Add Component Question" to add one.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
                                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                    <h4 className="font-bold text-white text-sm">Question #{idx + 1}</h4>
                                                    <button
                                                        onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Component Image</label>
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleImageUpload(e, (url) => {
                                                                const updated = [...questions];
                                                                updated[idx].image_path = url;
                                                                setQuestions(updated);
                                                            })}
                                                            className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                                        />
                                                        {q.image_path && (
                                                            <img src={q.image_path} alt="Preview" className="h-24 w-auto rounded-xl border border-slate-700 mt-2 bg-slate-900 object-contain p-1" />
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Component Name</label>
                                                            <input
                                                                type="text"
                                                                value={q.correct_name}
                                                                onChange={(e) => {
                                                                    const updated = [...questions];
                                                                    updated[idx].correct_name = e.target.value;
                                                                    setQuestions(updated);
                                                                }}
                                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Function Description</label>
                                                            <textarea
                                                                value={q.correct_function}
                                                                onChange={(e) => {
                                                                    const updated = [...questions];
                                                                    updated[idx].correct_function = e.target.value;
                                                                    setQuestions(updated);
                                                                }}
                                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                                rows="2"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-3 text-xs">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Distraction Options (Name Choices - Comma Separated)</label>
                                                        <input
                                                            type="text"
                                                            value={q.options.join(', ')}
                                                            onChange={(e) => {
                                                                const updated = [...questions];
                                                                updated[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                                setQuestions(updated);
                                                            }}
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                            placeholder="RAM, Graphics Card, CPU"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Distraction Options (Function Choices - Separated by '|')</label>
                                                        <textarea
                                                            value={q.function_options.join(' | ')}
                                                            onChange={(e) => {
                                                                const updated = [...questions];
                                                                updated[idx].function_options = e.target.value.split('|').map(s => s.trim()).filter(Boolean);
                                                                setQuestions(updated);
                                                            }}
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                            placeholder="Stores temporary data | Supplies power to board | Performs calculations"
                                                            rows="2"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Motherboard Hotspot Configuration */}
                    {lab.type === 'motherboard_hotspot' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                                <h3 className="text-base font-bold text-white mb-4">Motherboard Layout Graphic</h3>
                                
                                <div className="mb-4">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Motherboard Graphic</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageUpload(e)}
                                        className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                    />
                                </div>

                                {selectedAssetUrl ? (
                                    <div className="relative border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair bg-slate-950">
                                        <img
                                            ref={motherboardImageRef}
                                            src={selectedAssetUrl}
                                            alt="Motherboard Layout"
                                            className="w-full h-auto select-none"
                                            onClick={handleMotherboardClick}
                                        />
                                        {/* Render mapped Hotspots */}
                                        {hotspots.map((h, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    left: `${h.x_coord}%`,
                                                    top: `${h.y_coord}%`,
                                                    width: `${h.radius * 2}%`,
                                                    height: `${h.radius * 2}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                                className="absolute rounded-full border-2 border-emerald-400 bg-emerald-500/40 flex items-center justify-center text-[10px] text-white font-bold shadow-lg"
                                                title={h.label}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950">
                                        Please upload a motherboard schematic or photo to map clickable hotspot areas.
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 mt-3">
                                    💡 Click anywhere on the uploaded motherboard board graphic above to place a target hotspot and name it.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 h-fit">
                                <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-3">Mapped Hotspots ({hotspots.length})</h3>
                                {hotspots.length === 0 ? (
                                    <div className="text-slate-400 text-xs">No targets configured. Click on the image to place.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {hotspots.map((h, i) => (
                                            <div key={i} className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
                                                <div>
                                                    <span className="font-bold text-emerald-400 mr-2">#{i+1}</span>
                                                    <span className="font-semibold text-white">{h.label}</span>
                                                    <div className="text-[10px] text-slate-500 font-mono">X: {h.x_coord}% | Y: {h.y_coord}%</div>
                                                </div>
                                                <button
                                                    onClick={() => setHotspots(hotspots.filter((_, idx) => idx !== i))}
                                                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Assembly Sequence Configuration */}
                    {(lab.type === 'assembly_sequence' || lab.type === 'drag_drop_build' || lab.type === 'preventive_maintenance') && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">Assembly & Maintenance Steps</h3>
                                    <p className="text-xs text-slate-400">Define the chronological steps, safety-critical flags, and guidance hints.</p>
                                </div>
                                <button
                                    onClick={() => setSteps([...steps, {
                                        step_number: steps.length + 1,
                                        instruction: '',
                                        hint: '',
                                        is_safety_critical: false
                                    }])}
                                    className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition"
                                >
                                    + Add Step
                                </button>
                            </div>

                            {steps.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <span className="text-3xl block mb-2">🛠️</span>
                                    <p className="font-semibold text-sm text-slate-300">No steps defined yet.</p>
                                    <p className="text-xs text-slate-500 mt-1">Click "+ Add Step" to build the instruction sequence.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {steps.map((s, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex gap-4 items-start text-xs">
                                            <div className="font-black text-lg text-slate-500 pt-1 w-6 text-center">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2">
                                                    <input
                                                        type="text"
                                                        value={s.instruction}
                                                        onChange={(e) => {
                                                            const updated = [...steps];
                                                            updated[idx].instruction = e.target.value;
                                                            setSteps(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                        placeholder="Step instruction (e.g. Install CPU into socket and latch retention arm)"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={s.hint}
                                                        onChange={(e) => {
                                                            const updated = [...steps];
                                                            updated[idx].hint = e.target.value;
                                                            setSteps(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                        placeholder="Hint (optional)"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 pt-2">
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={s.is_safety_critical}
                                                        onChange={(e) => {
                                                            const updated = [...steps];
                                                            updated[idx].is_safety_critical = e.target.checked;
                                                            setSteps(updated);
                                                        }}
                                                        className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                                                    />
                                                    <span className="text-[10px] font-bold text-rose-400 uppercase">Safety Critical</span>
                                                </label>
                                                <button
                                                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                                                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Troubleshooting Scenarios Configuration */}
                    {lab.type === 'troubleshooting' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">Troubleshooting Scenarios</h3>
                                    <p className="text-xs text-slate-400">Create real-world hardware breakdown scenarios and symptom checklists.</p>
                                </div>
                                <button
                                    onClick={() => setScenarios([...scenarios, {
                                        title: '',
                                        scenario_text: '',
                                        symptoms: [],
                                        steps: [],
                                        correct_conclusion: ''
                                    }])}
                                    className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition"
                                >
                                    + Add Scenario
                                </button>
                            </div>

                            {scenarios.length === 0 ? (
                                <div className="p-16 text-center text-slate-400 font-medium">
                                    <span className="text-3xl block mb-2">🔍</span>
                                    <p className="font-semibold text-sm text-slate-300">No troubleshooting scenarios configured.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {scenarios.map((sc, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4 text-xs">
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <h4 className="font-bold text-white text-sm">Scenario #{idx + 1}</h4>
                                                <button
                                                    onClick={() => setScenarios(scenarios.filter((_, i) => i !== idx))}
                                                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Scenario Title</label>
                                                    <input
                                                        type="text"
                                                        value={sc.title}
                                                        onChange={(e) => {
                                                            const updated = [...scenarios];
                                                            updated[idx].title = e.target.value;
                                                            setScenarios(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Diagnosis Conclusion</label>
                                                    <input
                                                        type="text"
                                                        value={sc.correct_conclusion}
                                                        onChange={(e) => {
                                                            const updated = [...scenarios];
                                                            updated[idx].correct_conclusion = e.target.value;
                                                            setScenarios(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                        placeholder="e.g. faulty PSU, loose front panel power SW"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Scenario Description / Context</label>
                                                <textarea
                                                    value={sc.scenario_text}
                                                    onChange={(e) => {
                                                        const updated = [...scenarios];
                                                        updated[idx].scenario_text = e.target.value;
                                                        setScenarios(updated);
                                                    }}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                    rows="3"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Symptoms (Comma Separated)</label>
                                                    <input
                                                        type="text"
                                                        value={sc.symptoms.join(', ')}
                                                        onChange={(e) => {
                                                            const updated = [...scenarios];
                                                            updated[idx].symptoms = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                            setScenarios(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                                                        placeholder="No power, No display, fans do not spin"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                        Diagnostic Checklist Steps (Syntax: Name | finding_text | is_safety_critical)
                                                        <br />
                                                        <span className="text-[10px] text-slate-500 font-normal">Separate steps with a new line (Enter)</span>
                                                    </label>
                                                    <textarea
                                                        value={sc.steps.map(s => `${s.name} | ${s.finding} | ${s.is_safety_critical ? '1' : '0'}`).join('\n')}
                                                        onChange={(e) => {
                                                            const lines = e.target.value.split('\n');
                                                            const parsedSteps = lines.map(line => {
                                                                const parts = line.split('|').map(p => p.trim());
                                                                return {
                                                                    name: parts[0] || '',
                                                                    finding: parts[1] || '',
                                                                    is_safety_critical: parts[2] === '1'
                                                                };
                                                            }).filter(s => s.name);
                                                            
                                                            const updated = [...scenarios];
                                                            updated[idx].steps = parsedSteps;
                                                            setScenarios(updated);
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                                                        placeholder="Check Wall Socket | Wall socket output is normal | 0&#10;Check Front Panel Power Cable | Cable is disconnected | 0"
                                                        rows="4"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
