import { Link, useSearchParams } from 'react-router-dom';
import PostbackList from './PostbackList';
import PostbackOverview from './PostbackOverview';

export default function PostbackPage() {
    const [params] = useSearchParams();
    const logs = params.get('tab') === 'logs';
    return <section className="w-full min-w-0 space-y-5 px-3 py-5 text-slate-900 sm:px-4 lg:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Postback logs</h1>
        <nav aria-label="Postback reports" className="flex gap-5 border-b border-slate-200">
            {['Overview', 'Logs'].map(label => {
                const selected = logs === (label === 'Logs');
                return <Link key={label} to={'?tab=' + label.toLowerCase()} aria-current={selected ? 'page' : undefined}
                    className={'border-b-2 px-1 py-2 text-sm font-semibold ' + (selected ? 'border-slate-900' : 'border-transparent text-slate-500')}>{label}</Link>;
            })}
        </nav>
        {logs ? <PostbackList /> : <PostbackOverview />}
    </section>;
}
