"use client";

import React, { forwardRef } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingClick?: () => void;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      icon,
      trailingIcon,
      onTrailingClick,
      required,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || (props.name ? `field-${props.name}` : undefined);

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full min-h-[44px] text-[16px] sm:text-sm py-2.5 rounded-xl border bg-white text-[#17211E] placeholder:text-[#5D6D67]/60 focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] focus:border-transparent transition-all disabled:opacity-60 disabled:bg-[#FAF6EC] ${
              icon ? "pl-11" : "pl-3.5"
            } ${trailingIcon ? "pr-11" : "pr-3.5"} ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-[#E8E2D5]"
            } ${className}`}
            {...props}
          />
          {trailingIcon && (
            <button
              type="button"
              onClick={onTrailingClick}
              tabIndex={onTrailingClick ? 0 : -1}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] hover:text-[#17211E] p-1 flex items-center justify-center min-w-[32px] min-h-[32px] ${
                !onTrailingClick ? "pointer-events-none" : "cursor-pointer"
              }`}
            >
              {trailingIcon}
            </button>
          )}
        </div>
        {/* Reserved space to prevent layout jump */}
        <div className="min-h-[1.25rem] mt-1">
          {error ? (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          ) : helperText ? (
            <p className="text-xs text-[#5D6D67]">{helperText}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    { id, label, error, helperText, required, className = "", ...props },
    ref
  ) => {
    const inputId = id || (props.name ? `field-${props.name}` : undefined);

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full min-h-[96px] text-[16px] sm:text-sm p-3.5 rounded-xl border bg-white text-[#17211E] placeholder:text-[#5D6D67]/60 focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] focus:border-transparent transition-all disabled:opacity-60 resize-y leading-relaxed ${
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E8E2D5]"
          } ${className}`}
          {...props}
        />
        <div className="min-h-[1.25rem] mt-1">
          {error ? (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          ) : helperText ? (
            <p className="text-xs text-[#5D6D67]">{helperText}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";
