import { useSearchParams } from 'react-router-dom';
import { tabs } from './reportFormat';
import ConversionList from './ConversionList';
import ClickList from './ClickList';
import PayoutList from './PayoutList';

export default function ConversionPage() {
    const [params, setParams] = useSearchParams();
    const tab = Object.hasOwn(tabs, params.get('tab')) ? params.get('tab') : 'conversions';
    return <section className="w-full min-w-0 space-y-5 px-3 py-5 text-slate-900 sm:px-4 lg:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tracking activity</h1>
        <nav aria-label="Tracking reports" className="flex flex-wrap gap-4 border-b border-slate-200">
            {Object.entries(tabs).map(([key,label]) => <button key={key} type="button" aria-current={tab === key ? 'page' : undefined}
                onClick={() => setParams({ tab: key })} className={`border-b-2 px-1 py-2 text-sm font-semibold ${tab === key ? 'border-slate-900' : 'border-transparent text-slate-500'}`}>{label}</button>)}
        </nav>
        {tab === 'payouts' ? <PayoutList /> : tab === 'clicks' ? <ClickList /> : <ConversionList />}
    </section>;
}
