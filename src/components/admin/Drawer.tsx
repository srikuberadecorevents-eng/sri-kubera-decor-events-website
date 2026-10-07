"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

const widthMap = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "lg",
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthMap[width]} bg-white h-full shadow-2xl border-l border-[#E8E2D5] flex flex-col animate-in slide-in-from-right duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E8E2D5] bg-[#FAF6EC]/80 shrink-0">
          <h3 className="font-serif font-bold text-lg text-[#17211E]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5D6D67] hover:text-[#17211E] p-1.5 rounded-lg hover:bg-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
