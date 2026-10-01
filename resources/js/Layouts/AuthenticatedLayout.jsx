import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [themeState, setThemeState] = useState(
        typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <nav className="border-b border-slate-800 bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-blue-400" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={
                                        route().current('dashboard') ||
                                        route().current('admin.dashboard') ||
                                        route().current('instructor.dashboard') ||
                                        route().current('trainee.dashboard')
                                    }
                                >
                                    Dashboard
                                </NavLink>

                                {user.role?.name === 'admin' && (
                                    <>
                                        <NavLink href={route('admin.users.index')} active={route().current('admin.users.index')}>
                                            User Accounts
                                        </NavLink>
                                        <NavLink href={route('instructor.labs.index')} active={route().current('instructor.labs.*')}>
                                            🔬 Simulation Labs
                                        </NavLink>
                                        <NavLink href={route('instructor.courses.index')} active={route().current('instructor.courses.*')}>
                                            Course Editor
                                        </NavLink>
                                        <NavLink href={route('instructor.submissions.index')} active={route().current('instructor.submissions.*')}>
                                            Gradebook
                                        </NavLink>
                                        <NavLink href={route('admin.backups.index')} active={route().current('admin.backups.index')}>
                                            💾 Database Backups
                                        </NavLink>
                                        <NavLink href={route('admin.logs.index')} active={route().current('admin.logs.index')}>
                                            📜 System Audit
                                        </NavLink>
                                    </>
                                )}

                                {user.role?.name === 'instructor' && (
                                    <>
                                        <NavLink href={route('instructor.trainees.index')} active={route().current('instructor.trainees.index')}>
                                            Trainee Accounts
                                        </NavLink>
                                        <NavLink href={route('instructor.labs.index')} active={route().current('instructor.labs.*')}>
                                            🔬 Simulation Labs
                                        </NavLink>
                                        <NavLink href={route('instructor.courses.index')} active={route().current('instructor.courses.*')}>
                                            Course Editor
                                        </NavLink>
                                        <NavLink href={route('instructor.submissions.index')} active={route().current('instructor.submissions.*')}>
                                            Gradebook
                                        </NavLink>
                                    </>
                                )}

                                {user.role?.name === 'trainee' && (
                                    <>
                                        <NavLink href={route('trainee.dashboard')} active={route().current('trainee.dashboard') || route().current('trainee.labs.*')}>
                                            🔬 Simulation Labs
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    if (document.documentElement.classList.contains('dark')) {
                                        document.documentElement.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                        setThemeState('light');
                                    } else {
                                        document.documentElement.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                        setThemeState('dark');
                                    }
                                }}
                                className="me-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 transition"
                            >
                                {themeState === 'dark' ? '☀️ Light' : '🌙 Dark'}
                            </button>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium leading-4 text-slate-200 transition duration-150 ease-in-out hover:text-white hover:bg-slate-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={
                                route().current('dashboard') ||
                                route().current('admin.dashboard') ||
                                route().current('instructor.dashboard') ||
                                route().current('trainee.dashboard')
                            }
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {user.role?.name === 'admin' && (
                            <>
                                <ResponsiveNavLink href={route('admin.users.index')} active={route().current('admin.users.index')}>
                                    User Accounts
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.labs.index')} active={route().current('instructor.labs.*')}>
                                    🔬 Simulation Labs
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.courses.index')} active={route().current('instructor.courses.*')}>
                                    Course Editor
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.submissions.index')} active={route().current('instructor.submissions.*')}>
                                    Gradebook
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.backups.index')} active={route().current('admin.backups.index')}>
                                    💾 Database Backups
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.logs.index')} active={route().current('admin.logs.index')}>
                                    📜 System Audit
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user.role?.name === 'instructor' && (
                            <>
                                <ResponsiveNavLink href={route('instructor.trainees.index')} active={route().current('instructor.trainees.index')}>
                                    Trainee Accounts
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.labs.index')} active={route().current('instructor.labs.*')}>
                                    🔬 Simulation Labs
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.courses.index')} active={route().current('instructor.courses.*')}>
                                    Course Editor
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('instructor.submissions.index')} active={route().current('instructor.submissions.*')}>
                                    Gradebook
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user.role?.name === 'trainee' && (
                            <>
                                <ResponsiveNavLink href={route('trainee.dashboard')} active={route().current('trainee.dashboard') || route().current('trainee.labs.*')}>
                                    🔬 Simulation Labs
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4 flex items-center justify-between">
                            <div>
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (document.documentElement.classList.contains('dark')) {
                                        document.documentElement.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                        setThemeState('light');
                                    } else {
                                        document.documentElement.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                        setThemeState('dark');
                                    }
                                }}
                                className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 transition"
                            >
                                {themeState === 'dark' ? '☀️ Light' : '🌙 Dark'}
                            </button>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-slate-900 border-b border-slate-800 shadow-md">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
