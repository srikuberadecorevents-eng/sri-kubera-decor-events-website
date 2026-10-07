"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  GripVertical,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
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
import { Modal } from "@/components/admin/Modal";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { FormField } from "@/components/admin/FormField";
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
  designCount: number;
}

function SortableCategoryItem({
  cat,
  editId,
  editName,
  editSlug,
  setEditName,
  setEditSlug,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActive,
  onDeleteRequest,
  saving,
}: {
  cat: CategoryWithCount;
  editId: string | null;
  editName: string;
  editSlug: string;
  setEditName: (v: string) => void;
  setEditSlug: (v: string) => void;
  onStartEdit: (c: CategoryWithCount) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleActive: (c: CategoryWithCount) => void;
  onDeleteRequest: (c: CategoryWithCount) => void;
  saving: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const isEditing = editId === cat.id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[#E8E2D5] last:border-b-0 hover:bg-[#FAF6EC]/50 transition-colors ${
        cat.is_active === false ? "opacity-60 bg-[#FAF6EC]/30" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-[#5D6D67] hover:text-[#17211E] cursor-grab active:cursor-grabbing p-1 -ml-1 rounded min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
        aria-label={`Reorder ${cat.name}`}
      >
        <GripVertical size={18} />
      </button>

      {isEditing ? (
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              // Auto-generate slug if matching
              setEditSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              );
            }}
            placeholder="Category name"
            className="flex-1 min-h-[40px] text-sm px-3 py-1.5 rounded-lg border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            autoFocus
          />
          <input
            type="text"
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            placeholder="slug"
            className="w-full sm:w-44 min-h-[40px] text-xs font-mono px-3 py-1.5 rounded-lg border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={saving}
              className="min-h-[40px] px-3.5 py-1.5 bg-[#0B4A3A] text-white rounded-lg text-xs font-medium hover:bg-[#0E5A47] flex items-center gap-1 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className="min-h-[40px] px-2.5 py-1.5 bg-[#FAF6EC] text-[#5D6D67] hover:text-[#17211E] rounded-lg text-xs cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#17211E] truncate">
                {cat.name}
              </span>
              {cat.is_active === false && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#5D6D67] mt-0.5">
              <span className="font-mono text-[11px] text-[#5D6D67]/80">/{cat.slug || cat.name.toLowerCase()}</span>
              <span>•</span>
              <span>{cat.designCount} design{cat.designCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Active Toggle */}
            <button
              type="button"
              onClick={() => onToggleActive(cat)}
              className={`p-2 rounded-lg text-xs transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
                cat.is_active !== false
                  ? "text-[#0B4A3A] hover:bg-emerald-50"
                  : "text-[#5D6D67] hover:bg-stone-100"
              }`}
              title={cat.is_active !== false ? "Hide from website" : "Show on website"}
              aria-label={cat.is_active !== false ? "Hide category" : "Show category"}
            >
              {cat.is_active !== false ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onStartEdit(cat)}
              className="p-2 text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Edit category"
              aria-label="Edit category"
            >
              <Pencil size={15} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDeleteRequest(cat)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              title="Delete category"
              aria-label="Delete category"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit category state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Move designs & delete modal state
  const [catToDelete, setCatToDelete] = useState<CategoryWithCount | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetCatId, setTargetCatId] = useState<string>("");
  const [moving, setMoving] = useState(false);

  // Simple confirm delete state (when 0 designs)
  const [simpleDeleteOpen, setSimpleDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: cats, error: catErr }, { data: designs, error: desErr }] =
        await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
          supabase.from("designs").select("id, category_id"),
        ]);

      if (catErr) throw catErr;
      if (desErr) throw desErr;

      const designCountMap: Record<string, number> = {};
      designs?.forEach((d) => {
        if (d.category_id) {
          designCountMap[d.category_id] = (designCountMap[d.category_id] || 0) + 1;
        }
      });

      const withCounts: CategoryWithCount[] = (cats || []).map((c) => ({
        ...c,
        designCount: designCountMap[c.id] || 0,
      }));

      setCategories(withCounts);
    } catch (err) {
      console.error("Fetch categories error:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Drag Reorder
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    // Save sort_order to database
    try {
      const updates = reordered.map((cat, idx) => ({
        id: cat.id,
        sort_order: idx,
      }));

      for (const item of updates) {
        await supabase
          .from("categories")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success("Category order updated");
    } catch {
      toast.error("Failed to save reordered list");
      fetchCategories();
    }
  };

  // Add new category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) {
      toast.error("Please enter a category name");
      return;
    }

    const cleanSlug = (
      newSlug.trim() || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    ).replace(/^-|-$/g, "");

    setAdding(true);
    try {
      const nextSortOrder = categories.length;
      const { error } = await supabase.from("categories").insert({
        name: cleanName,
        slug: cleanSlug,
        sort_order: nextSortOrder,
        is_active: true,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("A category with this name or slug already exists");
        } else {
          throw error;
        }
      } else {
        const { revalidatePublicPages } = await import("@/app/actions/revalidate");
        await revalidatePublicPages(["/", "/gallery"]);

        toast.success(`Added "${cleanName}"`);
        setNewName("");
        setNewSlug("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Add error:", err);
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  // Start inline edit
  const handleStartEdit = (cat: CategoryWithCount) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  };

  // Save inline edit
  const handleSaveEdit = async () => {
    if (!editId || !editName.trim()) return;
    setSavingEdit(true);

    try {
      const cleanSlug = (
        editSlug.trim() || editName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      ).replace(/^-|-$/g, "");

      const { error } = await supabase
        .from("categories")
        .update({
          name: editName.trim(),
          slug: cleanSlug,
        })
        .eq("id", editId);

      if (error) {
        if (error.code === "23505") {
          toast.error("A category with this name or slug already exists");
        } else {
          throw error;
        }
      } else {
        const { revalidatePublicPages } = await import("@/app/actions/revalidate");
        await revalidatePublicPages(["/", "/gallery"]);

        toast.success("Category updated");
        setEditId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (cat: CategoryWithCount) => {
    const nextState = cat.is_active === false ? true : false;
    try {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: nextState })
        .eq("id", cat.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(
        nextState ? `"${cat.name}" is now visible` : `"${cat.name}" is now hidden`
      );
      fetchCategories();
    } catch {
      toast.error("Failed to change status");
    }
  };

  // Request deletion (checks if designs exist)
  const handleDeleteRequest = (cat: CategoryWithCount) => {
    setCatToDelete(cat);
    if (cat.designCount > 0) {
      // Must move designs first
      setTargetCatId(
        categories.find((c) => c.id !== cat.id)?.id || ""
      );
      setMoveModalOpen(true);
    } else {
      setSimpleDeleteOpen(true);
    }
  };

  // Execute simple delete (0 designs)
  const handleExecuteSimpleDelete = async () => {
    if (!catToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", catToDelete.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(`Deleted category "${catToDelete.name}"`);
      setSimpleDeleteOpen(false);
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  // Execute move designs & delete
  const handleMoveAndDelete = async () => {
    if (!catToDelete || !targetCatId) {
      toast.error("Please select a target category");
      return;
    }

    setMoving(true);
    try {
      // 1. Move all designs from old category to target category
      const { error: moveErr } = await supabase
        .from("designs")
        .update({ category_id: targetCatId })
        .eq("category_id", catToDelete.id);

      if (moveErr) throw moveErr;

      // 2. Delete the old category
      const { error: delErr } = await supabase
        .from("categories")
        .delete()
        .eq("id", catToDelete.id);

      if (delErr) throw delErr;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      const targetCat = categories.find((c) => c.id === targetCatId);
      toast.success(
        `Moved ${catToDelete.designCount} designs to "${targetCat?.name}" and deleted "${catToDelete.name}"`
      );

      setMoveModalOpen(false);
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error("Move and delete error:", err);
      toast.error("Failed to reassign designs and delete category");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
          Categories
        </h1>
        <p className="text-sm text-[#5D6D67] mt-1">
          Organise stage decoration designs into categories. Drag to reorder public filter tabs.
        </p>
      </div>

      {/* Add Category Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-3">
          Add New Category
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="new-cat-name" className="block text-xs text-[#5D6D67] mb-1">
              Category Title
            </label>
            <input
              id="new-cat-name"
              type="text"
              placeholder="e.g. Engagement"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNewSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                );
              }}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/50 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>

          <div className="w-full sm:w-56">
            <label htmlFor="new-cat-slug" className="block text-xs text-[#5D6D67] mb-1">
              URL Slug
            </label>
            <input
              id="new-cat-slug"
              type="text"
              placeholder="engagement"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm font-mono px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/50 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin text-[#C9A24B]" />
            ) : (
              <Plus size={16} />
            )}
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Reorderable List */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF6EC]/60 border-b border-[#E8E2D5] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
            Categories ({categories.length})
          </span>
          <span className="text-xs text-[#5D6D67]">
            Drag handles on the left to reorder
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5D6D67]">
            No categories created yet.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-[#E8E2D5]">
                {categories.map((cat) => (
                  <SortableCategoryItem
                    key={cat.id}
                    cat={cat}
                    editId={editId}
                    editName={editName}
                    editSlug={editSlug}
                    setEditName={setEditName}
                    setEditSlug={setEditSlug}
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

      {/* Simple Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={simpleDeleteOpen}
        onClose={() => {
          setSimpleDeleteOpen(false);
          setCatToDelete(null);
        }}
        onConfirm={handleExecuteSimpleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${catToDelete?.name}"? This category contains 0 designs and can be safely removed.`}
        confirmLabel="Delete Category"
        isDestructive
        isLoading={deleting}
      />

      {/* Move Designs Before Delete Modal */}
      <Modal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setCatToDelete(null);
        }}
        title="Move Designs Before Deleting Category"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs leading-relaxed">
            <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>Cannot directly delete:</strong> The category &ldquo;{catToDelete?.name}&rdquo; currently contains{" "}
              <strong>{catToDelete?.designCount}</strong> design(s). Please choose another category to reassign these designs before deleting.
            </p>
          </div>

          <div>
            <label
              htmlFor="target-category-select"
              className="block text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-2"
            >
              Move Designs To:
            </label>
            <select
              id="target-category-select"
              value={targetCatId}
              onChange={(e) => setTargetCatId(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            >
              {categories
                .filter((c) => c.id !== catToDelete?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.designCount} designs)
                  </option>
                ))}
            </select>
          </div>

          <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setMoveModalOpen(false);
                setCatToDelete(null);
              }}
              disabled={moving}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-[#17211E] bg-white border border-[#E8E2D5] rounded-xl hover:bg-[#FAF6EC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMoveAndDelete}
              disabled={moving || !targetCatId}
              className="min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {moving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Reassigning &amp; Deleting...
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Reassign &amp; Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
