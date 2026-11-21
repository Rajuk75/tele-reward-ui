import React from 'react';
import { UsersIcon, ShieldIcon, CheckIcon, UserIcon } from '../../../../components/common/Icons';

export default function UserStats({ stats, isLoading }) {
    const cards = [
        {
            title: 'Total Users',
            value: stats?.total ?? 0,
            sub: 'Registered accounts',
            icon: UsersIcon,
        },
        {
            title: 'Active Accounts',
            value: stats?.active ?? 0,
            sub: 'Operational users',
            icon: CheckIcon,
        },
        {
            title: 'Administrators',
            value: stats?.admins ?? 0,
            sub: 'Privileged access',
            icon: ShieldIcon,
        },
        {
            title: 'Standard Users',
            value: stats?.standardUsers ?? 0,
            sub: 'Regular members',
            icon: UserIcon,
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

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>{c.sub}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
