import React from 'react';

interface FormFieldProps {
  label: string | React.ReactNode; // Change this line
  details?: string;
  name: string;
  value: string;
  placeholder?: string; // Make placeholder optional
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  borderColor: string;
  isRequired: boolean;
  textarea?: boolean;
  maxLength?: number; // Add maxLength prop for textarea
  uppercase?: boolean; // Add uppercase prop
  type?: 'text' | 'date'; // Add this line
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  details = "",
  name,
  value,
  placeholder = "", // Provide a default value
  onChange,
  error = null,
  borderColor,
  isRequired,
  textarea = false,
  maxLength,
  uppercase = true,
  type = 'text', // Add this line with a default value
}) => {
  return (
    <div className="inline-flex flex-col items-center justify-center relative w-full gap-6">
      {/* Title and Instructions */}
      <div className="flex flex-col items-center">
        <p className="relative w-fit title-white">
          {typeof label === 'string' ? (
            <span className="text-white" dangerouslySetInnerHTML={{ __html: label }} />
          ) : (
            label
          )}
          {isRequired && <span className="text-[#ea4180]">*</span>}
        </p>
        <div className="relative text-xs text-white leading-[26px]">
          {details}
        </div>
      </div>
      {/* Input field container */}
      <div
        className={`relative ${
          textarea ? "h-[150px]" : "h-[67px]"
        } w-full rounded-xl overflow-hidden border-2 border-solid ${
          value ? borderColor : `${borderColor}80`
        }`}
      >
        {/* Dynamically displayed text based on input */}
        {/* {!value && !textarea && (
          <div
            className={`absolute top-[18px] left-[22px] font-black text-xl tracking-[0.60px] leading-[25.9px] whitespace-nowrap transition-all duration-200 text-[#8e8e93]`}
          >
            {placeholder.toUpperCase()}
          </div>
        )} */}
        {/* Actual input field */}
        {textarea ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="absolute top-0 left-0 w-full h-full opacity-100 cursor-text text-base p-4 bg-transparent text-white"
            style={{ height: "150px" }} // Adjust the height
          />
        ) : (
          <input
            type={type} // Change this line
            name={name}
            value={value || ""}
            placeholder={uppercase ? placeholder.toUpperCase() : placeholder}
            onChange={onChange}
            className={`absolute top-0 left-0 w-full h-full opacity-100 cursor-text text-base p-4 bg-transparent text-white ${
              uppercase ? "uppercase" : ""
            }`}
          />
        )}
      </div>
      {error && <p className="relative text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};


export default FormField;
