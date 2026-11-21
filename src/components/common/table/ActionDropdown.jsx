import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVerticalIcon } from '../Icons';

/**
 * ActionDropdown - A portal-based 3-dots action menu for data tables.
 * Renders directly in document.body so it is never clipped or trapped
 * inside table overflow containers (overflow-x-auto, overflow-hidden).
 */
export default function ActionDropdown({ children }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, openUpwards: false });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (open) {
            setOpen(false);
            return;
        }

        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const gap = 6;
        const menuWidth = 176; // w-44 = 11rem = 176px
        const estimatedMenuHeight = 180;
        const spaceBelow = window.innerHeight - rect.bottom - gap;
        const openUpwards = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

        const top = openUpwards ? rect.top - gap : rect.bottom + gap;
        const left = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, rect.right - menuWidth));

        setPosition({ top, left, openUpwards });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        const handleScrollOrResize = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setOpen(false);
        };

        document.addEventListener('pointerdown', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [open]);

    return (
        <div
            className="relative inline-block text-right"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <button
                ref={triggerRef}
                type="button"
                aria-label="Options"
                aria-expanded={open}
                onClick={handleToggle}
                className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer border ${
                    open
                        ? 'bg-slate-100 text-slate-900 border-slate-300'
                        : 'bg-white text-slate-500 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
                title="Options"
            >
                <MoreVerticalIcon size={15} />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: position.openUpwards ? 'auto' : `${position.top}px`,
                            bottom: position.openUpwards ? `${window.innerHeight - position.top}px` : 'auto',
                            left: `${position.left}px`,
                            zIndex: 99999,
                        }}
                        className="w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 text-left"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
                    </div>,
                    document.body
                )}
        </div>
    );
}
