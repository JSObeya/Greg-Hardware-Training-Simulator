import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Simulator Account" />

            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-white">Create Workstation</h2>
                <p className="text-xs text-slate-400 mt-1">
                    Register a new trainee account to start practicing hardware labs.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Full Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={data.name}
                        autoFocus
                        autoComplete="name"
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                        placeholder="e.g. John Doe"
                    />

                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={data.email}
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

                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Confirm Password
                    </label>

                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        required
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition"
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition shadow-lg shadow-blue-500/10 disabled:opacity-50"
                    >
                        {processing ? 'Registering Account...' : 'Register & Enter Workstation'}
                    </button>
                </div>
            </form>

            <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link href={route('login')} className="text-blue-500 font-semibold hover:underline">
                    Access Login
                </Link>
            </div>
        </GuestLayout>
    );
}
