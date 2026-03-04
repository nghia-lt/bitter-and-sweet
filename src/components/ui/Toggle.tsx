'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  icon?: string;
}

export function Toggle({ checked, onChange, label, icon }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm"
    >
      {icon && <span>{icon}</span>}
      {label && (
        <span className={checked ? 'text-white font-semibold' : 'text-gray-500'}>
          {label}
        </span>
      )}
      {/* Track */}
      <div
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          checked
            ? 'bg-purple-600 glow-purple'
            : 'bg-gray-700'
        }`}
      >
        {/* Thumb */}
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </div>
    </button>
  );
}
