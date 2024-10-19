"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  textarea?: boolean;
  maxLength?: number;
}

export const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  textarea = false,
  maxLength,
}: FormFieldProps) => {
  const inputClass =
    "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6A740] transition-all duration-300 bg-white text-neutral-900 placeholder-gray-400";

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-800"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          className={`${inputClass} h-28 resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClass}
          maxLength={maxLength}
        />
      )}
      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};
