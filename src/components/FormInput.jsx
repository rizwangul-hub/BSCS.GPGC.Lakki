import React from 'react';

/**
 * Reusable Form Input Component supporting text, password, number, select dropdowns, dates, and textareas
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  options = [], // [{ value, label }] for select type
  icon: Icon, // optional React Icon component
  rows = 3, // for textarea type
  className = '',
  disabled = false,
}) => {
  const inputId = `input-${name}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold font-heading text-secondary tracking-tight">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-stretch">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
            <Icon />
          </div>
        )}

        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full bg-white border rounded-xl py-2.5 px-4 text-sm font-body text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            rows={rows}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full bg-white border rounded-xl py-2.5 px-4 text-sm font-body text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed ${
              error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'
            }`}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full bg-white border rounded-xl py-2.5 px-4 text-sm font-body text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
          />
        )}

        {type === 'select' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        )}
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-[11px] font-medium font-body text-red-500 mt-0.5">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
