"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Star,
  Check,
  Plus,
  Trash2,
  Loader2,
  Save,
  Eye,
  GripVertical,
  AlertCircle,
  Sparkles,
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/clientImageUpload";
import type { Category, Design, DesignImage, DesignStatus } from "@/types";

const SUGGESTED_INCLUSIONS = [
  "Fresh flowers",
  "Artificial flowers",
  "LED & Spotlights",
  "Drapes & Curtains",
  "Backdrop Frame",
  "Stage Platform",
  "Entrance Arch",
  "Leaves & Greenery",
  "Name Board / Monogram",
  "Sofa / Chairs",
  "Pathway Pillars",
  "Welcome Board",
];

interface ImageItem {
  id: string; // temp id or design_images id
  media_id?: string;
  url: string; // full or preview
  url_card: string;
  alt: string;
  is_cover: boolean;
  sort_order: number;
}

interface DesignFormProps {
  initialDesign?: Design & {
    design_images?: (DesignImage & { media?: any })[];
  };
}

function SortablePhotoCard({
  item,
  onRemove,
  onSetCover,
  onAltChange,
}: {
  item: ImageItem;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
  onAltChange: (id: string, alt: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-2xl border overflow-hidden shadow-xs transition-all ${
        item.is_cover
          ? "border-[#C9A24B] ring-2 ring-[#C9A24B]/30"
          : "border-[#E8E2D5]"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[#FAF6EC]">
        <Image
          src={item.url_card || item.url}
          alt={item.alt || "Design photo"}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
        />

        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-lg opacity-80 group-hover:opacity-100 hover:bg-black cursor-grab active:cursor-grabbing transition-opacity"
          aria-label="Reorder photo"
        >
          <GripVertical size={14} />
        </button>

        {/* Cover badge / Set cover button */}
        {item.is_cover ? (
          <span className="absolute top-2 right-2 bg-[#C9A24B] text-[#05241C] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Star size={10} className="fill-[#05241C]" />
            Cover
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSetCover(item.id)}
            className="absolute top-2 right-2 bg-black/60 hover:bg-[#C9A24B] hover:text-[#05241C] text-white text-[10px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            Set as Cover
          </button>
        )}

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Remove photo"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-2.5">
        <input
          type="text"
          placeholder="Alt description (optional)"
          value={item.alt}
          onChange={(e) => onAltChange(item.id, e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-1 focus:ring-[#0B4A3A]"
        />
      </div>
    </div>
  );
}

export default function DesignForm({ initialDesign }: DesignFormProps) {
  const isEdit = Boolean(initialDesign?.id);
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initialDesign?.title || "");
  const [slug, setSlug] = useState(initialDesign?.slug || "");
  const [categoryId, setCategoryId] = useState(initialDesign?.category_id || "");
  const [description, setDescription] = useState(initialDesign?.description || "");
  const [price, setPrice] = useState(initialDesign?.price?.toString() || "");
  const [priceOnRequest, setPriceOnRequest] = useState(
    initialDesign?.price_on_request || false
  );
  const [isFeatured, setIsFeatured] = useState(initialDesign?.is_featured || false);
  const [status, setStatus] = useState<DesignStatus>(
    initialDesign?.status || "published"
  );

  // Inclusions chips
  const [inclusions, setInclusions] = useState<string[]>(() => {
    if (initialDesign?.inclusions_list?.length) {
      return initialDesign.inclusions_list;
    }
    if (initialDesign?.inclusions) {
      return initialDesign.inclusions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  });
  const [customInclusion, setCustomInclusion] = useState("");

  // Photos state
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (initialDesign?.design_images?.length) {
      return initialDesign.design_images.map((di, idx) => ({
        id: di.id || `img-${idx}`,
        media_id: di.media_id,
        url: di.media?.url_full || initialDesign.image_url,
        url_card: di.media?.url_card || initialDesign.image_url,
        alt: di.alt || "",
        is_cover: di.is_cover || idx === 0,
        sort_order: di.sort_order ?? idx,
      }));
    }
    if (initialDesign?.image_url) {
      return [
        {
          id: "primary",
          url: initialDesign.image_url,
          url_card: initialDesign.image_url,
          alt: initialDesign.title || "",
          is_cover: true,
          sort_order: 0,
        },
      ];
    }
    return [];
  });

  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setHasUnsavedChanges(true);
    if (!isEdit || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // Image Upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setHasUnsavedChanges(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setUploadingProgress(0);
        const result = await compressAndUploadImage(file, (p) => {
          setUploadingProgress(p);
        });

        setImages((prev) => {
          const isFirst = prev.length === 0;
          return [
            ...prev,
            {
              id: result.id || `uploaded-${Date.now()}-${Math.random()}`,
              media_id: result.id,
              url: result.url_full,
              url_card: result.url_card,
              alt: file.name.replace(/\.[^/.]+$/, ""),
              is_cover: isFirst,
              sort_order: prev.length,
            },
          ];
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    setUploadingProgress(null);
    e.target.value = "";
  };

  // Reorder photos
  const handlePhotoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const reordered = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));

    setImages(reordered);
    setHasUnsavedChanges(true);
  };

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === id,
      }))
    );
    setHasUnsavedChanges(true);
  };

  const handleRemovePhoto = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Ensure at least one cover remains
      if (filtered.length && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return filtered;
    });
    setHasUnsavedChanges(true);
  };

  const handleAltChange = (id: string, alt: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt } : img))
    );
    setHasUnsavedChanges(true);
  };

  // Inclusions chips handlers
  const toggleInclusion = (item: string) => {
    setHasUnsavedChanges(true);
    setInclusions((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const addCustomInclusion = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInclusion.trim();
    if (!clean) return;
    if (!inclusions.includes(clean)) {
      setInclusions((prev) => [...prev, clean]);
      setHasUnsavedChanges(true);
    }
    setCustomInclusion("");
  };

  // Save handler
  const handleSave = async (targetStatus?: DesignStatus) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Please enter a design title");
      return;
    }

    if (!images.length) {
      toast.error("Please add at least one photograph for this design");
      return;
    }

    setSaving(true);

    try {
      const finalStatus = targetStatus || status;
      const coverPhoto = images.find((img) => img.is_cover) || images[0];
      const cleanSlug = (
        slug.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      ).replace(/^-|-$/g, "");

      const payload = {
        title: cleanTitle,
        slug: cleanSlug,
        category_id: categoryId || null,
        description: description.trim() || null,
        price: priceOnRequest || !price ? null : parseFloat(price),
        price_on_request: priceOnRequest,
        inclusions: inclusions.join(", "),
        inclusions_list: inclusions,
        image_url: coverPhoto.url,
        status: finalStatus,
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      };

      let designId = initialDesign?.id;

      if (isEdit && designId) {
        const { error: updateError } = await supabase
          .from("designs")
          .update(payload)
          .eq("id", designId);

        if (updateError) throw updateError;
      } else {
        const { data: newDesign, error: insertError } = await supabase
          .from("designs")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) throw insertError;
        designId = newDesign.id;
      }

      // Sync design_images table if media_id is available
      if (designId) {
        // Clear old relations and re-insert
        await supabase.from("design_images").delete().eq("design_id", designId);

        const imagesToInsert = images
          .filter((img) => Boolean(img.media_id))
          .map((img, idx) => ({
            design_id: designId,
            media_id: img.media_id!,
            alt: img.alt || cleanTitle,
            sort_order: idx,
            is_cover: img.is_cover,
          }));

        if (imagesToInsert.length) {
          await supabase.from("design_images").insert(imagesToInsert);
        }
      }

      setHasUnsavedChanges(false);

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(
        isEdit
          ? `Design updated (${finalStatus})`
          : `Design created (${finalStatus})`
      );

      router.push("/admin/designs");
      router.refresh();
    } catch (err: any) {
      console.error("Save design error:", err);
      toast.error(err.message || "Failed to save design");
    } finally {
      setSaving(false);
    }
  };

  // Preview data
  const coverImage = images.find((i) => i.is_cover) || images[0];
  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/designs"
            className="p-2 text-[#5D6D67] hover:text-[#17211E] rounded-xl hover:bg-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E8E2D5]"
            aria-label="Back to designs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
              {isEdit ? "Edit Design" : "Create New Design"}
            </h1>
            <p className="text-xs text-[#5D6D67] mt-0.5">
              {isEdit ? `Editing ${initialDesign?.title}` : "Add stage decoration with photos and details"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] text-xs font-semibold hover:bg-[#FAF6EC] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#C9A24B]" />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                Publish Design
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
              Design Information
            </h2>

            {/* Title */}
            <div>
              <label htmlFor="design-title" className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5">
                Design Title <span className="text-red-500">*</span>
              </label>
              <input
                id="design-title"
                type="text"
                placeholder="e.g. Royal Grand Reception Stage"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            {/* Slug & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="design-slug" className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5">
                  URL Slug
                </label>
                <input
                  id="design-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="royal-grand-reception-stage"
                  className="w-full min-h-[44px] text-[16px] sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                />
              </div>

              <div>
                <label htmlFor="design-category" className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5">
                  Category
                </label>
                <select
                  id="design-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="design-price" className="block text-xs font-semibold uppercase text-[#17211E]">
                  Price in Rupees (INR)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceOnRequest}
                    onChange={(e) => {
                      setPriceOnRequest(e.target.checked);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A]"
                  />
                  <span className="text-xs text-[#5D6D67] font-medium">
                    Price on Request
                  </span>
                </label>
              </div>

              {!priceOnRequest ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] font-semibold text-sm">
                    Rs.
                  </span>
                  <input
                    id="design-price"
                    type="number"
                    min="0"
                    step="500"
                    placeholder="35000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full min-h-[44px] text-[16px] sm:text-sm pl-11 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                  />
                </div>
              ) : (
                <div className="p-3 bg-[#FAF6EC] rounded-xl border border-[#E8E2D5] text-xs text-[#5D6D67]">
                  Pricing will display as &ldquo;Price on Request&rdquo; on the website.
                </div>
              )}
            </div>

            {/* Description with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="design-desc" className="block text-xs font-semibold uppercase text-[#17211E]">
                  Description
                </label>
                <span className="text-xs text-[#5D6D67]">
                  {description.length} / 500 characters
                </span>
              </div>
              <textarea
                id="design-desc"
                rows={3}
                maxLength={500}
                placeholder="Exquisite stage setup featuring fresh jasmine garlands, golden backdrop drape and soft LED glow."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full min-h-[96px] text-[16px] sm:text-sm p-3 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed resize-y"
              />
            </div>

            {/* Toggles: Featured & Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-[#E8E2D5]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-5 h-5 rounded text-[#0B4A3A] focus:ring-[#0B4A3A]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#17211E] block">
                    Featured on Homepage
                  </span>
                  <span className="text-[11px] text-[#5D6D67]">
                    Highlight this setup on the home luxury gallery
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#17211E]">Status:</span>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as DesignStatus);
                    setHasUnsavedChanges(true);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E2D5] bg-[#FAF6EC] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Inclusions Chips */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
              Included Items &amp; Setup Features
            </h2>

            {/* Active chips */}
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B4A3A]/10 text-[#0B4A3A] text-xs font-medium border border-[#0B4A3A]/20"
                >
                  <Check size={13} className="text-[#0B4A3A]" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => toggleInclusion(item)}
                    className="p-0.5 hover:text-red-600 transition-colors ml-0.5"
                    aria-label={`Remove ${item}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5D6D67] mb-2">
                Suggested Inclusions (click to add/remove):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INCLUSIONS.map((item) => {
                  const selected = inclusions.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInclusion(item)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selected
                          ? "bg-[#0B4A3A] text-white border-[#0B4A3A]"
                          : "bg-[#FAF6EC]/60 text-[#17211E] border-[#E8E2D5] hover:border-[#0B4A3A]"
                      }`}
                    >
                      {selected ? `✓ ${item}` : `+ ${item}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Inclusion Input */}
            <form onSubmit={addCustomInclusion} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add custom inclusion (e.g. Dry ice smoke effect)"
                value={customInclusion}
                onChange={(e) => setCustomInclusion(e.target.value)}
                className="flex-1 min-h-[40px] text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 bg-[#0B4A3A] text-white rounded-xl text-xs font-medium hover:bg-[#0E5A47] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                Add
              </button>
            </form>
          </div>

          {/* Card: Photographs */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                  Photographs ({images.length})
                </h2>
                <p className="text-[11px] text-[#5D6D67]">
                  First or marked photo serves as the cover image. Drag to reorder gallery pictures.
                </p>
              </div>

              <label
                htmlFor="design-photo-upload"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
              >
                {uploadingProgress !== null ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
                    <span>{uploadingProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Add Photos</span>
                  </>
                )}
              </label>
              <input
                id="design-photo-upload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingProgress !== null}
              />
            </div>

            {images.length === 0 ? (
              <div
                className="border-2 border-dashed border-[#E8E2D5] rounded-2xl p-8 text-center bg-[#FAF6EC]/40 hover:border-[#0B4A3A] transition-colors cursor-pointer"
                onClick={() => document.getElementById("design-photo-upload")?.click()}
              >
                <Upload size={32} className="mx-auto text-[#0B4A3A] mb-2" />
                <p className="text-sm font-semibold text-[#17211E]">
                  Click to select decoration photos
                </p>
                <p className="text-xs text-[#5D6D67] mt-1">
                  Photos are compressed in-browser and converted to high-quality WebP automatically.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePhotoDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((item) => (
                      <SortablePhotoCard
                        key={item.id}
                        item={item}
                        onRemove={handleRemovePhoto}
                        onSetCover={handleSetCover}
                        onAltChange={handleAltChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right Column: 5 cols — Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#0B4A3A]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                    Public Live Preview
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0B4A3A]">
                  Card View
                </span>
              </div>

              {/* Exact Public Design Card Preview */}
              <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-md">
                <div className="relative aspect-[4/3] bg-[#FAF6EC]">
                  {coverImage ? (
                    <Image
                      src={coverImage.url_card || coverImage.url}
                      alt={title || "Preview"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5D6D67] gap-2">
                      <Sparkles size={24} className="text-[#C9A24B]" />
                      <span className="text-xs">No cover photo selected</span>
                    </div>
                  )}

                  {selectedCat && (
                    <span className="absolute top-3 left-3 bg-[#0B4A3A]/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs shadow-xs">
                      {selectedCat.name}
                    </span>
                  )}

                  {isFeatured && (
                    <span className="absolute top-3 right-3 bg-[#C9A24B] text-[#05241C] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Star size={11} className="fill-[#05241C]" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-serif font-bold text-lg text-[#17211E] mb-1 leading-snug">
                    {title || "Royal Stage Decoration"}
                  </h3>

                  <p className="text-sm font-semibold text-[#0B4A3A] mb-3">
                    {priceOnRequest || !price
                      ? "Price on Request"
                      : `Rs. ${Number(price).toLocaleString("en-IN")}`}
                  </p>

                  {description && (
                    <p className="text-xs text-[#5D6D67] line-clamp-2 mb-3 leading-relaxed">
                      {description}
                    </p>
                  )}

                  {inclusions.length > 0 && (
                    <div className="pt-2 border-t border-[#E8E2D5]">
                      <p className="text-[10px] uppercase font-bold text-[#5D6D67] tracking-wider mb-1.5">
                        Setup Highlights
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {inclusions.slice(0, 4).map((inc) => (
                          <span
                            key={inc}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EC] text-[#17211E] border border-[#E8E2D5]"
                          >
                            {inc}
                          </span>
                        ))}
                        {inclusions.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EC] text-[#5D6D67]">
                            +{inclusions.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
