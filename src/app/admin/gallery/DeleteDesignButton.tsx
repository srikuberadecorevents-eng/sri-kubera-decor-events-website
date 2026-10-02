"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function DeleteDesignButton({ designId }: { designId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this design? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from("designs").delete().eq("id", designId);
    if (error) {
      toast.error("Failed to delete design. Please try again.");
    } else {
      toast.success("Design deleted successfully");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      Delete
    </button>
  );
}
