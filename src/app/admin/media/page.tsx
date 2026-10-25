"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Filter,
  HardDrive,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/clientImageUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { CardGridSkeleton } from "@/components/admin/Skeleton";
import { deleteAdminItem } from "@/app/actions/admin-delete";
import toast from "react-hot-toast";

interface MediaItem {
  id: string;
  path_card: string;
  path_full: string;
  url_card: string;
  url_full: string;
  width?: number | null;
  height?: number | null;
  bytes_total: number;
  original_name?: string | null;
  created_at: string;
  usedInDesignsCount: number;
}

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1 GB free Supabase tier

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unused">("all");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  const supabase = createClient();

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch media items
      const { data: mediaData, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaError) throw mediaError;

      // 2. Fetch usage from design_images and designs
      const [{ data: designImages }, { data: designs }] = await Promise.all([
        supabase.from("design_images").select("media_id"),
        supabase.from("designs").select("id, image_url"),
      ]);

      const countMap: Record<string, number> = {};

      designImages?.forEach((di) => {
        if (di.media_id) {
          countMap[di.media_id] = (countMap[di.media_id] || 0) + 1;
        }
      });

      // Also count direct URL references in designs.image_url
      designs?.forEach((d) => {
        mediaData?.forEach((m) => {
          if (
            d.image_url &&
            (d.image_url.includes(m.path_card) ||
              d.image_url.includes(m.path_full) ||
              d.image_url === m.url_card ||
              d.image_url === m.url_full)
          ) {
            countMap[m.id] = (countMap[m.id] || 0) + 1;
          }
        });
      });

      const itemsWithUsage: MediaItem[] = (mediaData || []).map((m) => ({
        ...m,
        usedInDesignsCount: countMap[m.id] || 0,
      }));

      setMediaList(itemsWithUsage);
    } catch (err) {
      console.error("Failed to load media library:", err);
      toast.error("Failed to load media files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Calculate storage usage
  const totalBytesUsed = mediaList.reduce((acc, m) => acc + (m.bytes_total || 0), 0);
  const usagePercent = Math.min(100, Math.round((totalBytesUsed / STORAGE_LIMIT_BYTES) * 100));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setUploadProgress(0);
        await compressAndUploadImage(file, (progress) => {
          setUploadProgress(progress);
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    setUploadProgress(null);
    e.target.value = "";
    fetchMedia();
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filter === "unused") return m.usedInDesignsCount === 0;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredMedia.map((m) => m.id) : []);
  };

  const confirmDeleteSingle = (item: MediaItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    const idsToDelete = itemToDelete ? [itemToDelete.id] : selectedIds;
    if (idsToDelete.length === 0) return;

    const previous = [...mediaList];
    const previousSelected = [...selectedIds];
    const targetItem = itemToDelete;

    // Optimistic UI update
    setMediaList((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));
    setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
    setItemToDelete(null);
    setDeleteDialogOpen(false);
    setDeleting(true);

    try {
      const res = await deleteAdminItem({
        entity: "media",
        ids: idsToDelete,
        force: true,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete photo");
      }

      toast.success(
        idsToDelete.length === 1
          ? `Deleted photo ${targetItem?.original_name || ""}`
          : `Deleted ${idsToDelete.length} photos`
      );
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete selected photo(s)");
      setMediaList(previous);
      setSelectedIds(previousSelected);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Media Library
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Manage all uploaded stage decoration photographs and storage usage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="direct-media-upload"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            {uploadProgress !== null ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#C9A24B]" />
                <span>Uploading ({uploadProgress}%)</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Photos</span>
              </>
            )}
          </label>
          <input
            id="direct-media-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadProgress !== null}
          />
        </div>
      </div>

      {/* Storage Meter Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF6EC] text-[#0B4A3A] flex items-center justify-center border border-[#E8E2D5]">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#17211E] uppercase tracking-wider">
                Storage Allocation
              </p>
              <p className="text-xs text-[#5D6D67]">
                {(totalBytesUsed / (1024 * 1024)).toFixed(1)} MB used of 1,024 MB (1 GB Free Tier)
              </p>
            </div>
          </div>

          {usagePercent >= 90 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle size={13} />
              Critical: 90%+ Storage Used
            </span>
          ) : usagePercent >= 70 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle size={13} />
              Warning: 70%+ Storage Used
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-[#0B4A3A] border border-emerald-200">
              <CheckCircle2 size={13} />
              Healthy ({usagePercent}% used)
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#FAF6EC] rounded-full overflow-hidden border border-[#E8E2D5]">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              usagePercent >= 90
                ? "bg-red-600"
                : usagePercent >= 70
                ? "bg-amber-500"
                : "bg-[#0B4A3A]"
            }`}
            style={{ width: `${Math.max(2, usagePercent)}%` }}
          />
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#0B4A3A] text-white"
                : "bg-white border border-[#E8E2D5] text-[#17211E] hover:bg-[#FAF6EC]"
            }`}
          >
            All Photos ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unused")}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filter === "unused"
                ? "bg-[#0B4A3A] text-white"
                : "bg-white border border-[#E8E2D5] text-[#17211E] hover:bg-[#FAF6EC]"
            }`}
          >
            Unused Photos ({mediaList.filter((m) => m.usedInDesignsCount === 0).length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#5D6D67] cursor-pointer">
            <input
              type="checkbox"
              checked={filteredMedia.length > 0 && selectedIds.length === filteredMedia.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span>Select All</span>
          </label>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setItemToDelete(null);
                setDeleteDialogOpen(true);
              }}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              Delete {selectedIds.length} Selected
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchMedia()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh list"
            aria-label="Refresh media list"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Grid of Photos */}
      {loading ? (
        <CardGridSkeleton count={8} />
      ) : filteredMedia.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={filter === "unused" ? "No Unused Photos" : "No Media Files"}
          description={
            filter === "unused"
              ? "All uploaded photos are currently linked to designs on the website."
              : "Upload your first stage decoration photos to build your photo gallery."
          }
          actionLabel="Upload Photos"
          onAction={() => document.getElementById("direct-media-upload")?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isUsed = item.usedInDesignsCount > 0;

            return (
              <div
                key={item.id}
                className={`group relative bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all ${
                  isSelected
                    ? "border-red-500 ring-2 ring-red-500/30"
                    : "border-[#E8E2D5]"
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-square bg-[#FAF6EC]">
                  <Image
                    src={item.url_card || item.url_full}
                    alt={item.original_name || "Stage photo"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                  />

                  {/* Usage Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {isUsed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B4A3A]/90 text-white backdrop-blur-xs">
                        {item.usedInDesignsCount} design{item.usedInDesignsCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/90 text-white backdrop-blur-xs">
                        Unused
                      </span>
                    )}
                  </div>

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 right-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer shadow-sm"
                      aria-label={`Select ${item.original_name || "photo"}`}
                    />
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3">
                  <p
                    className="text-xs font-medium text-[#17211E] truncate"
                    title={item.original_name || ""}
                  >
                    {item.original_name || "Photo"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#5D6D67] mt-1">
                    <span>{Math.round((item.bytes_total || 0) / 1024)} KB</span>
                    <button
                      type="button"
                      onClick={() => confirmDeleteSingle(item)}
                      className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title={
                        isUsed
                          ? `Warning: photo is used in ${item.usedInDesignsCount} design(s)`
                          : "Delete photo"
                      }
                      aria-label={`Delete photo ${item.original_name || ""}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title={
          itemToDelete
            ? `Delete ${itemToDelete.original_name || "Photograph"}`
            : `Delete ${selectedIds.length} Photographs`
        }
        description={
          itemToDelete && itemToDelete.usedInDesignsCount > 0
            ? `WARNING: This photo is currently linked to ${itemToDelete.usedInDesignsCount} active design(s). Deleting it will permanently remove the files from Supabase Storage and may break design images on the public site.`
            : !itemToDelete && mediaList.some((m) => selectedIds.includes(m.id) && m.usedInDesignsCount > 0)
            ? `WARNING: One or more selected photos are currently linked to active designs. Deleting them will permanently remove the files from Supabase Storage and may break gallery images.`
            : "This will permanently delete the photograph files from Supabase Storage and remove their database records. This cannot be undone."
        }
        confirmLabel="Delete Permanently"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
