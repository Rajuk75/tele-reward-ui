import React from 'react';
import {
    LayersIcon,
    ActivityIcon,
    DollarIcon,
    TrendingUpIcon,
    ArrowUpRightIcon
} from '../../../../components/common/Icons';

export default function CampaignStats({ total = 0, campaigns = [] }) {
    const activeCount = campaigns.filter((c) => c.status === 'active').length;
    const totalCount = total || campaigns.length;

    const stats = [
        {
            title: 'Total Campaigns',
            value: totalCount ? totalCount.toLocaleString() : '24',
            change: '+3 new this week',
            trend: 'up',
            icon: LayersIcon,
        },
        {
            title: 'Active Campaigns',
            value: activeCount || (totalCount ? Math.ceil(totalCount * 0.75) : '18'),
            change: 'Delivering live traffic',
            trend: 'neutral',
            icon: ActivityIcon,
        },
        {
            title: 'Total Ad Budget',
            value: '₹1,45,000',
            change: '₹12,500 daily cap',
            trend: 'up',
            icon: DollarIcon,
        },
        {
            title: 'Conversions Tracked',
            value: '4,892',
            change: '+18.2% vs last week',
            trend: 'up',
            icon: TrendingUpIcon,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                    <div
                        key={idx}
                        className="group p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all flex items-center justify-between"
                    >
                        {/* Left: Content */}
                        <div className="flex-1 min-w-0 pr-3">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                {s.title}
                            </span>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
                                {s.value}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                {s.trend === 'up' && (
                                    <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                                        <ArrowUpRightIcon size={13} className="mr-0.5" />
                                    </span>
                                )}
                                <span>{s.change}</span>
                            </div>
                        </div>

                        {/* Right: Central Oriented Large B&W Icon */}
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-center text-slate-700 group-hover:text-slate-900 group-hover:bg-slate-100/80 group-hover:border-slate-300 transition-all">
                            <Icon size={24} strokeWidth={1.8} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
