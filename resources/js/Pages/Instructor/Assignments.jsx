import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Assignments({ assignments = [], labs = [], trainees = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [selectedTrainees, setSelectedTrainees] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        lab_id: '',
        trainee_ids: [],
        due_at: '',
    });

    const handleTraineeCheckboxChange = (traineeId) => {
        let updated;
        if (selectedTrainees.includes(traineeId)) {
            updated = selectedTrainees.filter(id => id !== traineeId);
        } else {
            updated = [...selectedTrainees, traineeId];
        }
        setSelectedTrainees(updated);
        setData('trainee_ids', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedTrainees.length === 0) {
            alert('Please select at least one trainee.');
            return;
        }
        post(route('instructor.assignments.store'), {
            onSuccess: () => {
                reset();
                setSelectedTrainees([]);
                setShowForm(false);
            },
        });
    };

    const handleDeleteAssignment = (id) => {
        if (confirm('Are you sure you want to retract this lab assignment? Trainee attempts will be deleted.')) {
            useForm().delete(route('instructor.assignments.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Lab Assignments & Cohort Distribution
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Assign practical simulation hardware labs to individual trainees or cohort groups.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
                    >
                        {showForm ? '✕ Close Form' : '+ Assign Lab Task'}
                    </button>
                </div>
            }
        >
            <Head title="Assignments Manager" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Assignment creation form */}
                    {showForm && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-xl mx-auto space-y-4">
                            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-2">
                                Distribute Lab Simulation
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Select Lab Simulator
                                    </label>
                                    <select
                                        value={data.lab_id}
                                        onChange={(e) => setData('lab_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        required
                                    >
                                        <option value="">-- Select Lab --</option>
                                        {labs.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.title} ({l.type.replace(/_/g, ' ')})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Select Trainees
                                    </label>
                                    {trainees.length === 0 ? (
                                        <div className="text-xs text-rose-400">No trainees registered. Register trainees first.</div>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto border border-slate-800 bg-slate-950 rounded-xl p-3 space-y-2">
                                            {trainees.map((t) => (
                                                <label key={t.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTrainees.includes(t.id)}
                                                        onChange={() => handleTraineeCheckboxChange(t.id)}
                                                        className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span>{t.name} <span className="text-slate-500 font-mono">({t.email})</span></span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Due Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.due_at}
                                        onChange={(e) => setData('due_at', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                                >
                                    Assign Lab to Selected Trainees
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Assignments Table Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <h4 className="text-base font-bold text-white">
                                Active Cohort Assignments
                            </h4>
                            <span className="text-xs text-slate-400">
                                Total: {assignments.length}
                            </span>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="text-3xl block mb-2">📋</span>
                                <p className="font-semibold text-sm text-slate-300">No labs assigned yet.</p>
                                <p className="text-xs text-slate-500 mt-1">Click "Assign Lab Task" to distribute tasks to trainees.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Trainee</th>
                                            <th className="px-6 py-3.5">Lab Title</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Due Date</th>
                                            <th className="px-6 py-3.5">Assigned By</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {assignments.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {a.trainee?.name}
                                                    <div className="text-[10px] text-slate-400 font-mono">{a.trainee?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-white">{a.lab?.title}</div>
                                                    <div className="text-[10px] text-blue-400">{a.lab?.module?.course?.title}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                                                        a.status === 'completed' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80' :
                                                        a.status === 'in_progress' ? 'bg-amber-950/80 text-amber-300 border-amber-700/80' :
                                                        'bg-blue-950/80 text-blue-300 border-blue-700/80'
                                                    }`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                                                    {a.due_at ? new Date(a.due_at).toLocaleDateString() : 'Perpetual'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{a.assigner?.name || 'Instructor'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteAssignment(a.id)}
                                                        className="rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 text-xs font-bold transition"
                                                    >
                                                        Retract
                                                    </button>
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
