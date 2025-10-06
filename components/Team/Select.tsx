// components/Ui/Select.tsx
import React from 'react'

export type Option = { value: string; label: string }

interface SelectProps {
  id?: string
  label?: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full' // convenience for border radius
}

const radiusMap: Record<NonNullable<SelectProps['rounded']>, string> = {
  sm: 'rounded-md',
  md: 'rounded-[lg]',
  lg: 'rounded-xl',
  full: 'rounded-full',
}

export default function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  rounded = 'md',
}: SelectProps) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={label ?? 'select'}
          className={[
            'appearance-none rounded-[10px] w-full px-4 py-2 pr-10 focus:border bg-[var(--secondary)] text-sm focus:outline-none focus:ring-[var(--border)] focus:border-[var(--border)]',
            'bg-[var(--custom)]',
            radiusMap[rounded],
          ].join(' ')}
        >
          {placeholder && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-300"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
