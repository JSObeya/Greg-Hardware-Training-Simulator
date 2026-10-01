import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ReviewAttempt({ attempt }) {
    const { data, setData, post, processing, errors } = useForm({
        score: attempt.score !== null ? attempt.score : 0,
        comments: attempt.feedbacks?.[0]?.comments || ''
    });

    const handleSubmitGrade = (e) => {
        e.preventDefault();
        post(route('instructor.submissions.grade', attempt.id), {
            onSuccess: () => {
                alert('Trainee attempt graded successfully!');
            }
        });
    };

    const lab = attempt.assignment.lab;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Review Lab Submission & Grading
                        </h2>
                        <span className="text-xs text-slate-400 block mt-1">
                            Trainee: <strong className="text-white">{attempt.trainee.name}</strong> ({attempt.trainee.email})
                        </span>
                    </div>
                    <Link
                        href={route('instructor.submissions.index')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                    >
                        &larr; Back to Gradebook Tracker
                    </Link>
                </div>
            }
        >
            <Head title="Grade Submission" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Middle: Workspace details & answers */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Meta information card */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                                Assessment Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Lab Title</span>
                                    <span className="font-bold text-white text-sm">{lab.title}</span>
                                </div>
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Lab Type</span>
                                    <span className="font-mono bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-blue-400 font-bold">{lab.type}</span>
                                </div>
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Course / Module</span>
                                    <span className="text-slate-300">{lab.module.course.title} &raquo; {lab.module.title}</span>
                                </div>
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Date Completed</span>
                                    <span className="text-slate-300 font-mono">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Repair Report contents */}
                        {lab.type === 'repair_report' && attempt.repair_report && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                                    Submitted Service Report Entries
                                </h3>

                                <div className="space-y-4 text-xs">
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Fault Reported</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.fault_reported}</div>
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Symptoms Observed</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.symptoms_observed}</div>
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Diagnostic Steps Performed</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.diagnostic_steps}</div>
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Diagnostic Findings</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.findings}</div>
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Corrective Action Taken</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.corrective_action}</div>
                                    </div>
                                    {attempt.repair_report.parts_replaced && (
                                        <div>
                                            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Replacement Parts / Consumables</span>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.parts_replaced}</div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Safety Precautions Followed</span>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.safety_precautions}</div>
                                    </div>
                                    {attempt.repair_report.recommendations && (
                                        <div>
                                            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Trainee Recommendations</span>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">{attempt.repair_report.recommendations}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Automated grading detail logs */}
                        {lab.type !== 'repair_report' && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                                    Trainee Simulation Attempt Transcript
                                </h3>
                                <p className="text-xs text-slate-400">
                                    The trainee completed interactive steps on the simulator workstation. Below is the auto-graded scoring telemetry.
                                </p>
                                
                                {attempt.scores && attempt.scores[0] && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950 text-center">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Component ID</span>
                                            <span className="text-lg font-black text-white">{round(attempt.scores[0].component_score, 1)}%</span>
                                        </div>
                                        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950 text-center">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assembly Order</span>
                                            <span className="text-lg font-black text-white">{round(attempt.scores[0].assembly_score, 1)}%</span>
                                        </div>
                                        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950 text-center">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Diagnosis accuracy</span>
                                            <span className="text-lg font-black text-white">{round(attempt.scores[0].diagnosis_score, 1)}%</span>
                                        </div>
                                        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950 text-center">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Safety Audit</span>
                                            <span className={`text-lg font-black block ${
                                                attempt.scores[0].safety_score >= 80 ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>{round(attempt.scores[0].safety_score, 1)}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Right: Grade & Feedback Form */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl h-fit space-y-4">
                        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                            Log Grade & Feedback
                        </h3>

                        <form onSubmit={handleSubmitGrade} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Overall Lab Score (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    required
                                    value={data.score}
                                    onChange={e => setData('score', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {errors.score && (
                                    <span className="text-rose-400 text-[10px] font-semibold mt-1 block">{errors.score}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Instructor Comments / Feedback
                                </label>
                                <textarea
                                    rows="5"
                                    value={data.comments}
                                    onChange={e => setData('comments', e.target.value)}
                                    placeholder="Enter performance feedback comments..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {errors.comments && (
                                    <span className="text-rose-400 text-[10px] font-semibold mt-1 block">{errors.comments}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition shadow-md"
                            >
                                {processing ? 'Saving assessment...' : 'Save Grade & Release Feedback'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
