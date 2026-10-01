import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Simulator Log In" />

            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-white">System Access</h2>
                <p className="text-xs text-slate-400 mt-1">
                    Log in with your workstation credentials to access labs.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Workstation Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={data.email}
                        autoFocus
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                        placeholder="e.g. trainee@gregco.local"
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 pr-10 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold font-mono focus:outline-none select-none"
                        >
                            {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950/50 text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="ms-2 text-xs text-slate-400 hover:text-slate-300">
                            Remember session
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-slate-500 hover:text-slate-300 hover:underline"
                        >
                            Reset Password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition shadow-lg shadow-blue-500/10 disabled:opacity-50"
                    >
                        {processing ? 'Decrypting Access Key...' : 'Authenticate & Enter'}
                    </button>
                </div>
            </form>
            
            <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link href={route('register')} className="text-blue-500 font-semibold hover:underline">
                    Create Account
                </Link>
            </div>
        </GuestLayout>
    );
}
