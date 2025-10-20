import React from "react";

// ------------------ Select reutilizable ------------------
interface SelectProps {
  label: string;
  name?: string;
  value: string | number;
  options: (string | number)[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  required,
  disabled = false,
}: SelectProps) => (
  <div className="mb-3">
    <label
      className="block text-sm font-medium mb-1"
      htmlFor={String(name ?? label)}
    >
      {label}
    </label>
    <select
      id={String(name ?? label)}
      name={name}
      value={String(value)}
      onChange={onChange}
      className="w-full border rounded px-2 py-1 disabled:opacity-50"
      required={required}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={String(opt)} value={String(opt)}>
          {String(opt)}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
