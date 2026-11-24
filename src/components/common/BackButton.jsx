import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';

export default function BackButton({
    to,
    onClick,
    label = 'Back',
    className = '',
    iconSize = 16,
    iconStrokeWidth = 2.5,
    showIcon = true,
    ...props
}) {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
            return;
        }
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={label ? `Go ${label.toLowerCase()}` : 'Go back'}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none group ${className}`}
            {...props}
        >
            {showIcon && (
                <ChevronRightIcon
                    aria-hidden="true"
                    size={iconSize}
                    strokeWidth={iconStrokeWidth}
                    className="rotate-180 text-slate-800 transition-transform group-hover:-translate-x-0.5"
                />
            )}
            {label && <span>{label}</span>}
        </button>
    );
}
