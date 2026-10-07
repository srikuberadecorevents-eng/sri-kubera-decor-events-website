import React from "react";
import {
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  FileEdit,
  Eye,
  Archive,
  Sparkles,
} from "lucide-react";
import type { BookingStatus, RequirementStatus, DesignStatus } from "@/types";

type AnyStatus = BookingStatus | RequirementStatus | DesignStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = String(status || "").toLowerCase();

  let config = {
    label: norm.charAt(0).toUpperCase() + norm.slice(1),
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Clock,
  };

  switch (norm) {
    // Bookings & Requirements
    case "pending":
    case "new":
      config = {
        label: norm === "new" ? "New" : "Pending",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Sparkles,
      };
      break;
    case "contacted":
      config = {
        label: "Contacted",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        icon: PhoneCall,
      };
      break;
    case "confirmed":
    case "converted":
      config = {
        label: norm === "converted" ? "Converted" : "Confirmed",
        bg: "bg-[#0B4A3A]/10 text-[#0B4A3A] border-[#0B4A3A]/25",
        icon: CheckCircle2,
      };
      break;
    case "rejected":
    case "closed":
      config = {
        label: norm === "closed" ? "Closed" : "Rejected",
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
      break;

    // Designs
    case "draft":
      config = {
        label: "Draft",
        bg: "bg-gray-100 text-gray-600 border-gray-200",
        icon: FileEdit,
      };
      break;
    case "published":
      config = {
        label: "Published",
        bg: "bg-emerald-50 text-[#0B4A3A] border-emerald-200",
        icon: Eye,
      };
      break;
    case "archived":
      config = {
        label: "Archived",
        bg: "bg-stone-100 text-stone-600 border-stone-200",
        icon: Archive,
      };
      break;
  }

  const Icon = config.icon;
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses} tracking-wide shrink-0`}
    >
      <Icon size={size === "sm" ? 12 : 13} />
      <span>{config.label}</span>
    </span>
  );
}
