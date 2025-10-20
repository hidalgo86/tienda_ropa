import React from "react";

// ------------------ Input reutilizable ------------------
interface InputProps {
  label: string;
  name: "name" | "description"; // solo campos de nivel raíz
  value: string | number;
  type?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  required,
  disabled = false,
}: InputProps) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1" htmlFor={String(name)}>
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={String(name)}
        name={name}
        value={String(value ?? "")}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
        rows={3}
      />
    ) : (
      <input
        id={String(name)}
        name={name}
        type={type}
        value={String(value)}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    )}
  </div>
);

export default InputField;
