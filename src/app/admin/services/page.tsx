"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Heart,
  Gift,
  Star,
  Home,
  Camera,
  Sparkles,
  Music,
  PartyPopper,
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
import type { Service } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Heart,
  Gift,
  Star,
  Briefcase,
  Home,
  Camera,
  Sparkles,
  Music,
  PartyPopper,
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

function SortableServiceItem({
  svc,
  editId,
  editData,
  setEditData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActive,
  onDeleteRequest,
  saving,
}: {
  svc: Service;
  editId: string | null;
  editData: { title: string; description: string; icon: string };
  setEditData: React.Dispatch<
    React.SetStateAction<{ title: string; description: string; icon: string }>
  >;
  onStartEdit: (s: Service) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleActive: (s: Service) => void;
  onDeleteRequest: (s: Service) => void;
  saving: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: svc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const isEditing = editId === svc.id;
  const IconComp = (svc.icon && ICON_MAP[svc.icon]) || Star;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border-b border-[#E8E2D5] last:border-b-0 hover:bg-[#FAF6EC]/40 transition-colors ${
        svc.is_active === false ? "opacity-60 bg-[#FAF6EC]/30" : ""
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                Service Title
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                Icon
              </label>
              <select
                value={editData.icon}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={editData.description}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
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
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            {/* Drag Handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="text-[#5D6D67] hover:text-[#17211E] cursor-grab active:cursor-grabbing p-1 -ml-1 rounded min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0"
              aria-label={`Reorder ${svc.title}`}
            >
              <GripVertical size={18} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#FAF6EC] text-[#0B4A3A] flex items-center justify-center shrink-0 border border-[#E8E2D5]">
              <IconComp size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#17211E] truncate">
                  {svc.title}
                </h3>
                {svc.is_active === false && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    Inactive
                  </span>
                )}
              </div>
              {svc.description && (
                <p className="text-xs text-[#5D6D67] line-clamp-1 mt-0.5">
                  {svc.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleActive(svc)}
              className={`p-2 rounded-lg text-xs transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
                svc.is_active !== false
                  ? "text-[#0B4A3A] hover:bg-emerald-50"
                  : "text-[#5D6D67] hover:bg-stone-100"
              }`}
              title={svc.is_active !== false ? "Hide service" : "Show service"}
              aria-label={svc.is_active !== false ? "Hide service" : "Show service"}
            >
              {svc.is_active !== false ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              type="button"
              onClick={() => onStartEdit(svc)}
              className="p-2 text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Edit service"
              aria-label="Edit service"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={() => onDeleteRequest(svc)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Delete service"
              aria-label="Delete service"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // New Service state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("Star");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    icon: "Star",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error("Fetch services error:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle Drag Reorder
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(services, oldIndex, newIndex);
    setServices(reordered);

    try {
      for (let i = 0; i < reordered.length; i++) {
        await supabase
          .from("services")
          .update({ sort_order: i })
          .eq("id", reordered[i].id);
      }

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/services"]);

      toast.success("Services order updated");
    } catch {
      toast.error("Failed to save reordered list");
      fetchServices();
    }
  };

  // Add Service
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Service title is required");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("services").insert({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        icon: newIcon,
        sort_order: services.length,
        is_active: true,
      });

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/services"]);

      toast.success(`Service "${newTitle}" added`);
      setNewTitle("");
      setNewDescription("");
      setNewIcon("Star");
      fetchServices();
    } catch (err) {
      console.error("Add service error:", err);
      toast.error("Failed to add service");
    } finally {
      setAdding(false);
    }
  };

  // Start edit
  const handleStartEdit = (svc: Service) => {
    setEditId(svc.id);
    setEditData({
      title: svc.title,
      description: svc.description || "",
      icon: svc.icon || "Star",
    });
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editId || !editData.title.trim()) return;
    setSavingEdit(true);

    try {
      const { error } = await supabase
        .from("services")
        .update({
          title: editData.title.trim(),
          description: editData.description.trim() || null,
          icon: editData.icon,
        })
        .eq("id", editId);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/services"]);

      toast.success("Service updated");
      setEditId(null);
      fetchServices();
    } catch (err) {
      console.error("Update service error:", err);
      toast.error("Failed to update service");
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (svc: Service) => {
    const nextState = svc.is_active === false ? true : false;
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: nextState })
        .eq("id", svc.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/services"]);

      toast.success(
        nextState ? `"${svc.title}" is now visible` : `"${svc.title}" is now hidden`
      );
      fetchServices();
    } catch {
      toast.error("Failed to change visibility");
    }
  };

  // Request delete
  const handleDeleteRequest = (svc: Service) => {
    setServiceToDelete(svc);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/services"]);

      toast.success(`Deleted service "${serviceToDelete.title}"`);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      console.error("Delete service error:", err);
      toast.error("Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
          Services
        </h1>
        <p className="text-sm text-[#5D6D67] mt-1">
          Manage event decoration service offerings displayed on the website. Drag to reorder.
        </p>
      </div>

      {/* Add Service Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-3">
          Add New Service
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label htmlFor="new-svc-title" className="block text-xs text-[#5D6D67] mb-1">
                Service Title
              </label>
              <input
                id="new-svc-title"
                type="text"
                placeholder="e.g. Wedding Mandapam Decoration"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="new-svc-icon" className="block text-xs text-[#5D6D67] mb-1">
                Icon
              </label>
              <select
                id="new-svc-icon"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="new-svc-desc" className="block text-xs text-[#5D6D67] mb-1">
              Short Description
            </label>
            <textarea
              id="new-svc-desc"
              rows={2}
              placeholder="Elegant and memorable stage decorations tailored to your vision."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
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
            Add Service
          </button>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF6EC]/60 border-b border-[#E8E2D5] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
            Active Services ({services.length})
          </span>
          <span className="text-xs text-[#5D6D67]">
            Drag handles on the left to reorder
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : services.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5D6D67]">
            No services listed yet.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-[#E8E2D5]">
                {services.map((svc) => (
                  <SortableServiceItem
                    key={svc.id}
                    svc={svc}
                    editId={editId}
                    editData={editData}
                    setEditData={setEditData}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditId(null)}
                    onToggleActive={handleToggleActive}
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
          setServiceToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Delete Service"
        description={`Are you sure you want to delete "${serviceToDelete?.title}"? This service will be removed from the public website.`}
        confirmLabel="Delete Service"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
