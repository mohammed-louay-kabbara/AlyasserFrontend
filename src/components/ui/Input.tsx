import React from "react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  className = "",
  disabled = false,
  error,
  label,
  required = false,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
        disabled={disabled}
        {...(props as any)}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
