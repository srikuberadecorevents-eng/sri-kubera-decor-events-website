"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { BookingStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: BookingStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Contacted", value: "contacted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
];

interface Props {
  bookingId: string;
  currentStatus: BookingStatus;
  currentNotes: string;
}

export default function EnquiryStatusForm({ bookingId, currentStatus, currentNotes }: Props) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status, admin_notes: notes })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update enquiry status");
    } else {
      toast.success("Enquiry status updated successfully");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="enquiry-status-select" className="input-label">Status</label>
        <select
          id="enquiry-status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus)}
          className="input-field"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="enquiry-notes" className="input-label">
          Admin Notes <span className="text-navy-400 font-normal">(visible to customer)</span>
        </label>
        <textarea
          id="enquiry-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Spoke with the customer, venue confirmed for 15th January..."
          className="input-field resize-none"
        />
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />Save Changes</>}
      </button>
    </div>
  );
}
