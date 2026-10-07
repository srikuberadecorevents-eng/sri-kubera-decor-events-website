"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Quote,
  MessageSquare,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import type { Testimonial } from "@/types";

function SortableTestimonialItem({
  t,
  editId,
  editData,
  setEditData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTogglePublish,
  onDeleteRequest,
  saving,
}: {
  t: Testimonial;
  editId: string | null;
  editData: {
    customer_name: string;
    event_type: string;
    quote: string;
    rating: number;
  };
  setEditData: React.Dispatch<
    React.SetStateAction<{
      customer_name: string;
      event_type: string;
      quote: string;
      rating: number;
    }>
  >;
  onStartEdit: (t: Testimonial) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTogglePublish: (t: Testimonial) => void;
  onDeleteRequest: (t: Testimonial) => void;
  saving: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const isEditing = editId === t.id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border-b border-[#E8E2D5] last:border-b-0 hover:bg-[#FAF6EC]/40 transition-colors ${
        !t.is_published ? "opacity-60 bg-[#FAF6EC]/30" : ""
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={editData.customer_name}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                Event Type
              </label>
              <input
                type="text"
                value={editData.event_type}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    event_type: e.target.value,
                  }))
                }
                placeholder="e.g. Wedding Reception"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                Rating (1 to 5)
              </label>
              <select
                value={editData.rating}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    rating: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
              Customer Review Quote
            </label>
            <textarea
              rows={3}
              value={editData.quote}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, quote: e.target.value }))
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg border border-[#E8E2D5] text-xs text-[#5D6D67] hover:bg-[#FAF6EC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={saving}
              className="px-4 py-1.5 bg-[#0B4A3A] hover:bg-[#0E5A47] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Drag Handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="text-[#5D6D67] hover:text-[#17211E] cursor-grab active:cursor-grabbing p-1 -ml-1 rounded min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 mt-0.5"
              aria-label={`Reorder testimonial from ${t.customer_name}`}
            >
              <GripVertical size={18} />
            </button>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#17211E]">
                  {t.customer_name}
                </span>
                {t.event_type && (
                  <span className="text-xs text-[#5D6D67]">
                    • {t.event_type}
                  </span>
                )}
                {!t.is_published && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    Draft (Hidden)
                  </span>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400" />
                ))}
              </div>

              <p className="text-xs text-[#5D6D67] line-clamp-2 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePublish(t)}
              className={`p-2 rounded-lg text-xs transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
                t.is_published
                  ? "text-[#0B4A3A] hover:bg-emerald-50"
                  : "text-[#5D6D67] hover:bg-stone-100"
              }`}
              title={t.is_published ? "Unpublish review" : "Publish review"}
              aria-label={t.is_published ? "Unpublish review" : "Publish review"}
            >
              {t.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              type="button"
              onClick={() => onStartEdit(t)}
              className="p-2 text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Edit review"
              aria-label="Edit review"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={() => onDeleteRequest(t)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Delete review"
              aria-label="Delete review"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // New testimonial state
  const [newName, setNewName] = useState("");
  const [newEvent, setNewEvent] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    customer_name: "",
    event_type: "",
    quote: "",
    rating: 5,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error("Fetch testimonials error:", err);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Drag Reorder
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = testimonials.findIndex((t) => t.id === active.id);
    const newIndex = testimonials.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(testimonials, oldIndex, newIndex);
    setTestimonials(reordered);

    try {
      for (let i = 0; i < reordered.length; i++) {
        await supabase
          .from("testimonials")
          .update({ sort_order: i })
          .eq("id", reordered[i].id);
      }

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success("Testimonials order saved");
    } catch {
      toast.error("Failed to save reordered list");
      fetchTestimonials();
    }
  };

  // Add testimonial
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQuote.trim()) {
      toast.error("Customer name and review quote are required");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        customer_name: newName.trim(),
        event_type: newEvent.trim() || null,
        quote: newQuote.trim(),
        rating: newRating,
        is_published: true,
        sort_order: testimonials.length,
      });

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success("Review added and published");
      setNewName("");
      setNewEvent("");
      setNewQuote("");
      setNewRating(5);
      fetchTestimonials();
    } catch (err) {
      console.error("Add testimonial error:", err);
      toast.error("Failed to add review");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (t: Testimonial) => {
    setEditId(t.id);
    setEditData({
      customer_name: t.customer_name,
      event_type: t.event_type || "",
      quote: t.quote,
      rating: t.rating || 5,
    });
  };

  const handleSaveEdit = async () => {
    if (!editId || !editData.customer_name.trim() || !editData.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          customer_name: editData.customer_name.trim(),
          event_type: editData.event_type.trim() || null,
          quote: editData.quote.trim(),
          rating: editData.rating,
        })
        .eq("id", editId);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success("Review updated");
      setEditId(null);
      fetchTestimonials();
    } catch (err) {
      console.error("Update testimonial error:", err);
      toast.error("Failed to update review");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePublish = async (t: Testimonial) => {
    const nextState = !t.is_published;
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_published: nextState })
        .eq("id", t.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success(
        nextState ? "Review is now published on website" : "Review unpublished"
      );
      fetchTestimonials();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteRequest = (t: Testimonial) => {
    setItemToDelete(t);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success("Review deleted");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchTestimonials();
    } catch (err) {
      console.error("Delete review error:", err);
      toast.error("Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
          Testimonials &amp; Reviews
        </h1>
        <p className="text-sm text-[#5D6D67] mt-1">
          Manage authentic client feedback shown on the public site. Only published reviews appear.
        </p>
      </div>

      {/* Add Testimonial Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-3">
          Add Client Review
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="new-test-name" className="block text-xs text-[#5D6D67] mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="new-test-name"
                type="text"
                placeholder="e.g. Ramesh &amp; Priya"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div>
              <label htmlFor="new-test-event" className="block text-xs text-[#5D6D67] mb-1">
                Event Type
              </label>
              <input
                id="new-test-event"
                type="text"
                placeholder="e.g. Wedding Reception"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div>
              <label htmlFor="new-test-rating" className="block text-xs text-[#5D6D67] mb-1">
                Star Rating
              </label>
              <select
                id="new-test-rating"
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value, 10))}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="new-test-quote" className="block text-xs text-[#5D6D67] mb-1">
              Customer Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              id="new-test-quote"
              rows={2}
              placeholder="e.g. Saravanan sir and the Sri Kubera team created the most breathtaking flower mandapam for our wedding. Everyone praised the stage decoration!"
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin text-[#C9A24B]" />
            ) : (
              <Plus size={16} />
            )}
            Add &amp; Publish Review
          </button>
        </form>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF6EC]/60 border-b border-[#E8E2D5] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
            Client Testimonials ({testimonials.length})
          </span>
          <span className="text-xs text-[#5D6D67]">
            Drag handles on the left to reorder
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : testimonials.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5D6D67]">
            No client reviews added yet. The public testimonials section remains hidden until you add at least one review.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={testimonials.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-[#E8E2D5]">
                {testimonials.map((t) => (
                  <SortableTestimonialItem
                    key={t.id}
                    t={t}
                    editId={editId}
                    editData={editData}
                    setEditData={setEditData}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditId(null)}
                    onTogglePublish={handleTogglePublish}
                    onDeleteRequest={handleDeleteRequest}
                    saving={savingEdit}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Delete Testimonial"
        description={`Are you sure you want to delete the review from "${itemToDelete?.customer_name}"?`}
        confirmLabel="Delete Review"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
