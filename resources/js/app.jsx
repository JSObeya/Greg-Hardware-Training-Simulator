import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function AppWrapper({ App, props }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unbindStart = router.on('start', () => setLoading(true));
        const unbindFinish = router.on('finish', () => setLoading(false));

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    return (
        <>
            <App {...props} />
            {loading && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300">
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="relative flex items-center justify-center w-16 h-16">
                            {/* Spinning outer circle */}
                            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                            {/* Spinning loader border */}
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                            {/* Inner logo/dot */}
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>
                        <span className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wider uppercase animate-pulse">
                            Loading Simulator...
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<AppWrapper App={App} props={props} />);
    },
    progress: false,
});
