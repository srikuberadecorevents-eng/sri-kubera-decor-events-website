"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  typedConfirmationText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  typedConfirmationText,
  isLoading = false,
}: ConfirmDialogProps) {
  const [typedInput, setTypedInput] = useState("");

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) {
      setTypedInput("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isConfirmDisabled =
    isLoading ||
    (Boolean(typedConfirmationText) &&
      typedInput.trim().toLowerCase() !==
        typedConfirmationText?.trim().toLowerCase());

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E8E2D5] overflow-hidden max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#17211E]">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-[#5D6D67] hover:text-[#17211E] p-1.5 rounded-lg hover:bg-[#FAF6EC] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-sm text-[#5D6D67] leading-relaxed break-words">
            {description}
          </p>

          {typedConfirmationText && (
            <div>
              <label
                htmlFor="confirm-typed-input"
                className="block text-xs font-semibold text-[#17211E] mb-1.5"
              >
                Type <span className="font-mono font-bold text-red-600">{typedConfirmationText}</span> to confirm:
              </label>
              <input
                id="confirm-typed-input"
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={typedConfirmationText}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                autoComplete="off"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-[#E8E2D5] bg-[#FAF6EC]/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-[#17211E] bg-white border border-[#E8E2D5] rounded-xl hover:bg-[#FAF6EC] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isConfirmDisabled}
            className={`min-h-[44px] px-5 py-2 text-sm font-medium text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 shadow-sm"
                : "bg-[#0B4A3A] hover:bg-[#0E5A47] shadow-sm"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
