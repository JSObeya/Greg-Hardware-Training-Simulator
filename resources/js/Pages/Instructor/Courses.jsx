import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Courses({ courses = [] }) {
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [activeCourseIdForModule, setActiveCourseIdForModule] = useState(null);

    const courseForm = useForm({
        title: '',
        description: '',
    });

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

    const handleCreateModule = (e) => {
        e.preventDefault();
        moduleForm.post(route('instructor.modules.store'), {
            onSuccess: () => {
                moduleForm.reset();
                setActiveCourseIdForModule(null);
            },
        });
    };

    const handleDeleteModule = (id) => {
        if (confirm('Are you sure you want to delete this module? All labs inside it will be deleted.')) {
            useForm().delete(route('instructor.modules.destroy', id));
        }
    };

    const handleDeleteCourse = (id) => {
        if (confirm('Are you sure you want to delete this course?')) {
            useForm().delete(route('instructor.courses.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-white">
                            Course Syllabus & Modules
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Structure hardware courses, define curriculum hierarchy, and organize simulation labs.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('instructor.labs.index')}
                            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition"
                        >
                            All Labs Manager
                        </Link>
                        <button
                            onClick={() => setShowCourseForm(!showCourseForm)}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
                        >
                            {showCourseForm ? '✕ Close Form' : '+ Create New Course'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Course Syllabus Manager" />

            <div className="py-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Course Form */}
                    {showCourseForm && (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 max-w-xl mx-auto">
                            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
                                Create New Course
                            </h3>
                            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.data.title}
                                        onChange={(e) => courseForm.setData('title', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        placeholder="e.g. Advanced Desktop Architecture & Diagnostic Engineering"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Description & Overview
                                    </label>
                                    <textarea
                                        value={courseForm.data.description}
                                        onChange={(e) => courseForm.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        rows="3"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={courseForm.processing}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md"
                                >
                                    Create Course
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Courses Listing */}
                    {courses.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center text-slate-400">
                            <span className="text-3xl block mb-2">📚</span>
                            <p className="font-semibold text-sm text-slate-300">No courses available.</p>
                            <p className="text-xs text-slate-500 mt-1">Click "Create New Course" to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {courses.map((course) => (
                                <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-800 pb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-white">
                                                {course.title}
                                            </h3>
                                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                                {course.description || 'No description provided.'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setActiveCourseIdForModule(course.id);
                                                    moduleForm.setData('course_id', course.id);
                                                }}
                                                className="rounded-xl border border-sky-800/80 bg-sky-950/60 hover:bg-sky-900 text-sky-300 px-3 py-1.5 text-xs font-bold transition"
                                            >
                                                + Add Module
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 text-xs font-bold transition"
                                            >
                                                Delete Course
                                            </button>
                                        </div>
                                    </div>

                                    {/* Module Addition Form Inside Course Card */}
                                    {activeCourseIdForModule === course.id && (
                                        <div className="p-4 rounded-xl border border-slate-700 bg-slate-950 max-w-lg space-y-3">
                                            <h4 className="font-bold text-white text-xs">Add Module to {course.title}</h4>
                                            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Module Title (e.g. Power Supply & Front Panel Connectors)"
                                                        value={moduleForm.data.title}
                                                        onChange={(e) => moduleForm.setData('title', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <textarea
                                                        placeholder="Module Description"
                                                        value={moduleForm.data.description}
                                                        onChange={(e) => moduleForm.setData('description', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white"
                                                        rows="2"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={moduleForm.processing}
                                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-md"
                                                    >
                                                        Save Module
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

                                    {/* Modules List */}
                                    <div>
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Modules Syllabus</h4>
                                        {course.modules.length === 0 ? (
                                            <p className="text-slate-500 text-xs pl-2">No modules configured for this course yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {course.modules.map((module) => (
                                                    <div key={module.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div>
                                                            <h5 className="font-bold text-white text-sm">
                                                                {module.title}
                                                            </h5>
                                                            <p className="text-slate-400 text-xs mt-0.5">
                                                                {module.description}
                                                            </p>
                                                            {/* Labs under this module */}
                                                            {module.labs && module.labs.length > 0 && (
                                                                <div className="mt-2.5 flex flex-wrap gap-2">
                                                                    {module.labs.map(lab => (
                                                                        <Link
                                                                            key={lab.id}
                                                                            href={route('instructor.labs.edit', lab.id)}
                                                                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-blue-500/60 hover:text-blue-300 transition flex items-center gap-1"
                                                                        >
                                                                            <span>🔬</span>
                                                                            <span>{lab.title}</span>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Link
                                                                href={route('instructor.labs.index')}
                                                                className="rounded-xl border border-sky-800/80 bg-sky-950/60 hover:bg-sky-900 px-2.5 py-1 text-xs font-bold text-sky-300 transition"
                                                            >
                                                                + Add Lab
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteModule(module.id)}
                                                                className="rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 px-2.5 py-1 text-xs font-bold text-rose-300 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
