import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Courses({ courses = [] }) {
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [activeCourseIdForModule, setActiveCourseIdForModule] = useState(null);

    // Edit Programme Modal State
    const [editingCourse, setEditingCourse] = useState(null);
    const editCourseForm = useForm({
        title: '',
        description: '',
    });

    // Edit Pathway Module Modal State
    const [editingModule, setEditingModule] = useState(null);
    const editModuleForm = useForm({
        title: '',
        description: '',
        order_index: 0,
    });

    // Create Course Form
    const courseForm = useForm({
        title: '',
        description: '',
    });

    // Create Module Form
    const moduleForm = useForm({
        course_id: '',
        title: '',
        description: '',
        order_index: 0,
    });

    const handleCreateCourse = (e) => {
        e.preventDefault();
        courseForm.post(route('instructor.courses.store'), {
            onSuccess: () => {
                courseForm.reset();
                setShowCourseForm(false);
            },
        });
    };

    const openEditCourseModal = (course) => {
        setEditingCourse(course);
        editCourseForm.setData({
            title: course.title || '',
            description: course.description || '',
        });
    };

    const handleEditCourseSubmit = (e) => {
        e.preventDefault();
        if (!editingCourse) return;
        editCourseForm.put(route('instructor.courses.update', editingCourse.id), {
            onSuccess: () => setEditingCourse(null),
        });
    };

    const handleCreateModule = (e) => {
        e.preventDefault();
        moduleForm.post(route('instructor.modules.store'), {
            onSuccess: () => {
                moduleForm.reset();
                setActiveCourseIdForModule(null);
            },
        });
    };

    const openEditModuleModal = (module) => {
        setEditingModule(module);
        editModuleForm.setData({
            title: module.title || '',
            description: module.description || '',
            order_index: module.order_index ?? 0,
        });
    };

    const handleEditModuleSubmit = (e) => {
        e.preventDefault();
        if (!editingModule) return;
        editModuleForm.put(route('instructor.modules.update', editingModule.id), {
            onSuccess: () => setEditingModule(null),
        });
    };

    const handleDeleteModule = (id, title) => {
        if (confirm(`Are you sure you want to delete pathway module "${title}"? All labs inside it will be detached.`)) {
            useForm().delete(route('instructor.modules.destroy', id));
        }
    };

    const handleDeleteCourse = (id, title) => {
        if (confirm(`Are you sure you want to delete academic programme "${title}"? This cannot be undone.`)) {
            useForm().delete(route('instructor.courses.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            <h2 className="text-xl font-bold leading-tight text-white">
                                Academic Programmes & Pathways
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Curate degree & certification programmes, structure modular pathways, and organize hardware simulation labs.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('instructor.labs.index')}
                            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                        >
                            <span>🔬</span>
                            <span>Simulation Labs</span>
                        </Link>
                        <button
                            onClick={() => setShowCourseForm(!showCourseForm)}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
                        >
                            <span>{showCourseForm ? '✕' : '+'}</span>
                            <span>{showCourseForm ? 'Close Form' : 'New Programme'}</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Academic Programmes & Pathways" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Quick Programme Overview Header Banner */}
                    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/80">
                                Curriculum Hierarchy
                            </span>
                            <h3 className="text-base font-bold text-white">
                                Academic Programmes &rarr; Modular Pathways &rarr; Interactive Labs
                            </h3>
                            <p className="text-xs text-slate-400">
                                Click "✏️ Edit Programme" or "✏️ Edit Pathway" below to update titles, syllabus descriptions, and sequencing.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
                                <div className="text-indigo-400 font-bold text-lg">{courses.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase">Programmes</div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
                                <div className="text-sky-400 font-bold text-lg">
                                    {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
                                </div>
                                <div className="text-[10px] text-slate-400 uppercase">Pathways</div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
                                <div className="text-emerald-400 font-bold text-lg">
                                    {courses.reduce((acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.labs?.length || 0), 0) || 0), 0)}
                                </div>
                                <div className="text-[10px] text-slate-400 uppercase">Labs Linked</div>
                            </div>
                        </div>
                    </div>

                    {/* Create Programme Drawer */}
                    {showCourseForm && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-xl mx-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>➕</span>
                                    <span>Create New Academic Programme</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCourseForm(false)}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Programme Title
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.data.title}
                                        onChange={(e) => courseForm.setData('title', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                                        placeholder="e.g. Advanced Desktop Architecture & Diagnostic Engineering"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Description & Curriculum Objectives
                                    </label>
                                    <textarea
                                        value={courseForm.data.description}
                                        onChange={(e) => courseForm.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                                        rows="3"
                                        placeholder="Outline competencies, practical lab milestones, and target certification outcomes..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowCourseForm(false)}
                                        className="w-1/3 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={courseForm.processing}
                                        className="w-2/3 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                                    >
                                        {courseForm.processing ? 'Creating...' : 'Save & Publish Programme'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Programmes Listing */}
                    {courses.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400">
                            <span className="text-3xl block mb-2">📚</span>
                            <p className="font-semibold text-sm text-slate-300">No academic programmes configured yet.</p>
                            <p className="text-xs text-slate-500 mt-1">Click "New Programme" to establish your first hardware syllabus.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {courses.map((course) => {
                                const totalCourseLabs = course.modules?.reduce((acc, m) => acc + (m.labs?.length || 0), 0) || 0;
                                return (
                                    <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
                                        {/* Programme Card Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-800 pb-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/80">
                                                        🎓 Programme #{course.id}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {course.modules?.length || 0} Pathways &bull; {totalCourseLabs} Labs
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-white">
                                                    {course.title}
                                                </h3>
                                                <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
                                                    {course.description || 'No description provided for this academic programme.'}
                                                </p>
                                            </div>

                                            {/* Action Buttons for Programme */}
                                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditCourseModal(course)}
                                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                                    title="Edit Programme details"
                                                >
                                                    <span>✏️</span>
                                                    <span>Edit Programme</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveCourseIdForModule(activeCourseIdForModule === course.id ? null : course.id);
                                                        moduleForm.setData({
                                                            course_id: course.id,
                                                            title: '',
                                                            description: '',
                                                            order_index: (course.modules?.length || 0) + 1,
                                                        });
                                                    }}
                                                    className="rounded-xl border border-sky-800/80 bg-sky-950/60 hover:bg-sky-900 text-sky-300 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5"
                                                >
                                                    <span>+</span>
                                                    <span>Add Pathway</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                                    className="rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-2 text-xs font-bold transition"
                                                    title="Delete Programme"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Module Addition Form Inside Course Card */}
                                        {activeCourseIdForModule === course.id && (
                                            <div className="p-5 rounded-2xl border border-sky-800/60 bg-sky-950/30 max-w-xl space-y-3">
                                                <div className="flex items-center justify-between border-b border-sky-900/60 pb-2">
                                                    <h4 className="font-bold text-sky-200 text-xs flex items-center gap-1.5">
                                                        <span>🛤️</span>
                                                        <span>Add Modular Pathway to: {course.title}</span>
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveCourseIdForModule(null)}
                                                        className="text-xs text-slate-400 hover:text-white"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Pathway Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Power Supply & Front Panel Connectors"
                                                            value={moduleForm.data.title}
                                                            onChange={(e) => moduleForm.setData('title', e.target.value)}
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Description & Competencies
                                                        </label>
                                                        <textarea
                                                            placeholder="Specify key diagnostic procedures and components covered..."
                                                            value={moduleForm.data.description}
                                                            onChange={(e) => moduleForm.setData('description', e.target.value)}
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500"
                                                            rows="2"
                                                        />
                                                    </div>
                                                    <div className="w-1/3">
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Sequence Order
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={moduleForm.data.order_index}
                                                            onChange={(e) => moduleForm.setData('order_index', parseInt(e.target.value) || 0)}
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            type="submit"
                                                            disabled={moduleForm.processing}
                                                            className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-xs font-bold transition shadow-md"
                                                        >
                                                            {moduleForm.processing ? 'Saving...' : 'Save Pathway'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveCourseIdForModule(null)}
                                                            className="rounded-xl bg-slate-800 text-slate-300 px-4 py-2 text-xs font-bold transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Pathways / Modules List */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span>🛤️</span>
                                                    <span>Modular Pathways & Labs</span>
                                                </h4>
                                                <span className="text-[11px] text-slate-500 font-mono">
                                                    {course.modules?.length || 0} Modules defined
                                                </span>
                                            </div>

                                            {(!course.modules || course.modules.length === 0) ? (
                                                <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/50 text-center text-slate-500 text-xs">
                                                    No pathways defined yet for this programme. Click "+ Add Pathway" above.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {course.modules.map((module, mIdx) => (
                                                        <div
                                                            key={module.id}
                                                            className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
                                                        >
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                                                        #{module.order_index ?? (mIdx + 1)}
                                                                    </span>
                                                                    <h5 className="font-bold text-white text-sm">
                                                                        {module.title}
                                                                    </h5>
                                                                </div>
                                                                <p className="text-slate-400 text-xs leading-relaxed">
                                                                    {module.description || 'No description entered for this pathway.'}
                                                                </p>

                                                                {/* Labs under this pathway module */}
                                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                                        Labs ({module.labs?.length || 0}):
                                                                    </span>
                                                                    {(!module.labs || module.labs.length === 0) ? (
                                                                        <span className="text-[11px] text-slate-500 italic">
                                                                            No labs linked yet
                                                                        </span>
                                                                    ) : (
                                                                        module.labs.map((lab) => (
                                                                            <Link
                                                                                key={lab.id}
                                                                                href={route('instructor.labs.edit', lab.id)}
                                                                                className="rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-blue-300 hover:border-blue-500/50 transition flex items-center gap-1.5"
                                                                                title="Click to configure lab simulator"
                                                                            >
                                                                                <span>🔬</span>
                                                                                <span>{lab.display_title || lab.title}</span>
                                                                            </Link>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Pathway Actions */}
                                                            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModuleModal(module)}
                                                                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                                                    title="Edit Pathway Title, Description & Sequence"
                                                                >
                                                                    <span>✏️</span>
                                                                    <span>Edit Pathway</span>
                                                                </button>
                                                                <Link
                                                                    href={route('instructor.labs.index')}
                                                                    className="rounded-xl border border-sky-800/80 bg-sky-950/60 hover:bg-sky-900 px-3 py-1.5 text-xs font-bold text-sky-300 transition"
                                                                    title="Manage simulation labs"
                                                                >
                                                                    + Lab
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteModule(module.id, module.title)}
                                                                    className="rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 px-2.5 py-1.5 text-xs font-bold text-rose-300 transition"
                                                                    title="Delete Pathway"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            {/* Edit Programme Modal */}
            {editingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✏️</span>
                                <h3 className="text-base font-bold text-white">
                                    Edit Academic Programme
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingCourse(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditCourseSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Programme Title
                                </label>
                                <input
                                    type="text"
                                    value={editCourseForm.data.title}
                                    onChange={(e) => editCourseForm.setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Description & Overview
                                </label>
                                <textarea
                                    value={editCourseForm.data.description}
                                    onChange={(e) => editCourseForm.setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    rows="4"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
                                    className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editCourseForm.processing}
                                    className="w-1/2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                                >
                                    {editCourseForm.processing ? 'Saving...' : 'Update Programme'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Pathway Module Modal */}
            {editingModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✏️</span>
                                <h3 className="text-base font-bold text-white">
                                    Edit Modular Pathway
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingModule(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditModuleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Pathway Title
                                </label>
                                <input
                                    type="text"
                                    value={editModuleForm.data.title}
                                    onChange={(e) => editModuleForm.setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Description & Competencies
                                </label>
                                <textarea
                                    value={editModuleForm.data.description}
                                    onChange={(e) => editModuleForm.setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="w-1/3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Sequence Order Index
                                </label>
                                <input
                                    type="number"
                                    value={editModuleForm.data.order_index}
                                    onChange={(e) => editModuleForm.setData('order_index', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                                    min="0"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingModule(null)}
                                    className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editModuleForm.processing}
                                    className="w-1/2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                                >
                                    {editModuleForm.processing ? 'Saving...' : 'Update Pathway'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
