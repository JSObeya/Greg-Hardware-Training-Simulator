import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Submissions({ attempts = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold leading-tight text-white">
                        Trainee Lab Submissions & Gradebook
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Review, grade, and export trainee service reports and simulation runs.
                    </p>
                </div>
            }
        >
            <Head title="Submissions Tracker" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <div>
                                <h3 className="text-base font-bold text-white">Active Submissions Tracker</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Chronological stream of trainee simulation attempts and service diagnostics.
                                </p>
                            </div>
                            <span className="text-xs text-slate-400">
                                Total: {attempts.length}
                            </span>
                        </div>

                        {attempts.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="text-3xl block mb-2">📝</span>
                                <p className="font-semibold text-sm text-slate-300">No trainee lab submissions yet.</p>
                                <p className="text-xs text-slate-500 mt-1">When trainees complete simulator workstations, runs will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-6">Trainee</th>
                                            <th className="py-3.5 px-6">Lab Title</th>
                                            <th className="py-3.5 px-6">Completed Date</th>
                                            <th className="py-3.5 px-6">Score</th>
                                            <th className="py-3.5 px-6">Status</th>
                                            <th className="py-3.5 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {attempts.map((attempt) => (
                                            <tr key={attempt.id} className="hover:bg-slate-800/50 transition">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-white">{attempt.trainee?.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{attempt.trainee?.email}</div>
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-white">
                                                    {attempt.assignment?.lab?.title}
                                                    <div className="text-[10px] text-blue-400 font-normal">
                                                        {attempt.assignment?.lab?.module?.course?.title}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                                                    {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 font-black text-sm text-emerald-400">
                                                    {attempt.score !== null ? `${round(attempt.score, 1)}%` : 'Pending'}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        attempt.status === 'graded'
                                                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                                            : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                                                    }`}>
                                                        {attempt.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    <Link
                                                        href={route('instructor.submissions.review', attempt.id)}
                                                        className="inline-flex rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-md"
                                                    >
                                                        {attempt.status === 'graded' ? 'Review & Edit' : 'Grade & Feedback'}
                                                    </Link>
                                                    
                                                    <a
                                                        href={route('instructor.submissions.pdf', attempt.id)}
                                                        className="inline-flex rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-bold border border-slate-700 transition"
                                                    >
                                                        PDF Report
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helpers
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
