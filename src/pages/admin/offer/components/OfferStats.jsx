import React from 'react';
import { LayersIcon, ActivityIcon, GlobeIcon, DollarIcon } from '../../../../components/common/Icons';

export default function OfferStats({ stats, isLoading }) {
    const cards = [
        {
            title: 'Total Offers',
            value: stats?.total ?? 0,
            sub: 'Configured deals',
            icon: LayersIcon,
        },
        {
            title: 'Active Offers',
            value: stats?.active ?? 0,
            sub: 'Currently running',
            icon: ActivityIcon,
        },
        {
            title: 'Public Visible',
            value: stats?.visible ?? 0,
            sub: 'Live in Telegram app',
            icon: GlobeIcon,
        },
        {
            title: 'Avg User Payout',
            value: `₹${stats?.avgPayout ?? 0}`,
            sub: 'Reward per completion',
            icon: DollarIcon,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between"
                    >
                        {/* Subtle background SVG Icon (Central-Right oriented) */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none text-slate-900">
                            <Icon size={72} strokeWidth={1.5} />
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                {c.title}
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-2">
                                {isLoading ? (
                                    <div className="h-7 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                                        {c.value}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-500 font-medium">
                            {c.sub}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
