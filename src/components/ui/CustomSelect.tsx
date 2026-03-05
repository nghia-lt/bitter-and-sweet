'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomSelect({ value, options, onChange, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find(o => o.value === value);

  // Position the portal dropdown below the trigger button
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const handleOpen = () => {
    updatePosition();
    setOpen(v => !v);
  };

  // Close on outside click — must exclude BOTH the trigger and the portal dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inDropdown = dropdownRef.current?.contains(e.target as Node);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close only when the PAGE scrolls (not the dropdown itself)
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      className="rounded-lg border border-white/10 overflow-y-auto shadow-2xl"
      style={{ ...dropdownStyle, background: '#1a1a2e', maxHeight: 200 }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => { onChange(opt.value); setOpen(false); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-white/10"
          style={{
            color: opt.value === value ? '#C084FC' : 'white',
            background: opt.value === value ? 'rgba(168,85,247,0.15)' : 'transparent',
          }}
        >
          {opt.icon && <span>{opt.icon}</span>}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="relative flex-1 text-xs">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-white border border-white/10 transition"
        style={{ background: '#1a1a2e' }}
      >
        {selected?.icon && <span>{selected.icon}</span>}
        <span className="flex-1 truncate">{selected?.label ?? placeholder ?? '...'}</span>
        <span className="text-gray-500 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {/* Render dropdown via portal so it escapes overflow:hidden parents */}
      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
