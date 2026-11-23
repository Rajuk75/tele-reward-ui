import React from 'react';
import { FiShare2, FiCheckCircle, FiMousePointer, FiTrendingUp } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

export default function ReferralStats({ stats, isLoading }) {
    const cards = [
        {
            title: 'Total Referrers',
            value: stats?.total ?? 0,
            sub: 'Configured affiliate links',
            icon: FiShare2,
            color: 'text-slate-900',
            iconColor: 'text-slate-700',
        },
        {
            title: 'Active Links',
            value: stats?.active ?? 0,
            sub: 'Currently accepting traffic',
            icon: FiCheckCircle,
            color: 'text-emerald-700',
            iconColor: 'text-emerald-600',
        },
        {
            title: 'Total Clicks',
            value: Number(stats?.clicks ?? 0).toLocaleString(),
            sub: 'Unique referral redirects',
            icon: FiMousePointer,
            color: 'text-blue-700',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Conversions',
            value: Number(stats?.conversions ?? 0).toLocaleString(),
            sub: 'Completed milestone events',
            icon: FiTrendingUp,
            color: 'text-indigo-700',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'Partner Earnings',
            value: `₹${stats?.earningsINR ?? '0.00'}`,
            sub: 'Total commission generated',
            icon: FaRupeeSign,
            color: 'text-emerald-700',
            iconColor: 'text-emerald-600',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between"
                    >
                        {/* Large, clearly visible watermark icon on right side */}
                        <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none ${card.iconColor}`}>
                            <Icon size={56} strokeWidth={2} />
                        </div>

                        <div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                {card.title}
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-2">
                                {isLoading ? (
                                    <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" />
                                ) : (
                                    <span className={`text-xl font-black tracking-tight font-mono ${card.color}`}>
                                        {card.value}
                                    </span>
                                )}
                            </div>
                        </div>

                        <span className="text-[11px] font-medium text-slate-600 mt-2 block truncate">
                            {card.sub}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
