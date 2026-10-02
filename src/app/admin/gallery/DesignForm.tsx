"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Upload, X, Loader2, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  category_id: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  inclusions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: {
    id: string;
    title: string;
    category_id?: string;
    description?: string;
    price?: number;
    inclusions?: string;
    image_url: string;
  };
}

export default function DesignForm({ initialData }: Props) {
  const isEdit = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || "",
      category_id: initialData?.category_id || "",
      description: initialData?.description || "",
      price: initialData?.price?.toString() || "",
      inclusions: initialData?.inclusions || "",
    },
  });

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Upload failed");
    } else {
      setImageUrl(data.url);
      toast.success("Image uploaded successfully");
    }
    setUploading(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!imageUrl) {
      toast.error("Please upload an image for this design");
      return;
    }

    setSaving(true);
    const payload = {
      title: data.title,
      category_id: data.category_id || null,
      description: data.description || null,
      price: data.price ? parseFloat(data.price) : null,
      inclusions: data.inclusions || null,
      image_url: imageUrl,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("designs").update(payload).eq("id", initialData!.id));
    } else {
      ({ error } = await supabase.from("designs").insert(payload));
    }

    if (error) {
      toast.error(isEdit ? "Failed to update design" : "Failed to add design");
    } else {
      toast.success(isEdit ? "Design updated successfully" : "Design added successfully");
      router.push("/admin/gallery");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/gallery" className="btn-ghost">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900">
            {isEdit ? "Edit Design" : "Add New Design"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image upload */}
        <div>
          <label className="input-label mb-2 block">Design Photo</label>
          <div
            className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-cream-400 bg-cream-100 overflow-hidden cursor-pointer hover:border-gold-400 transition-colors"
            onClick={() => document.getElementById("design-image-input")?.click()}
          >
            {imageUrl ? (
              <>
                <Image src={imageUrl} alt="Design preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageUrl(""); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-navy-400">
                {uploading ? (
                  <><Loader2 size={32} className="animate-spin text-gold-500" /><p className="text-sm">Compressing and uploading...</p></>
                ) : (
                  <><Upload size={32} /><p className="text-sm font-medium">Click to upload photo</p><p className="text-xs">JPG, PNG — converted to WebP automatically</p></>
                )}
              </div>
            )}
          </div>
          <input
            id="design-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="design-title" className="input-label">Title</label>
            <input id="design-title" type="text" placeholder="Royal Wedding Stage" className="input-field" {...register("title")} />
            {errors.title && <p className="input-error">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="design-category" className="input-label">Category</label>
            <select id="design-category" className="input-field" {...register("category_id")}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design-price" className="input-label">
              Price (Rs.) <span className="text-navy-400 font-normal">(optional)</span>
            </label>
            <input id="design-price" type="number" min="0" step="500" placeholder="25000" className="input-field" {...register("price")} />
          </div>

          <div>
            <label htmlFor="design-desc" className="input-label">Description</label>
            <textarea id="design-desc" rows={3} placeholder="Brief description of the decoration..." className="input-field resize-none" {...register("description")} />
          </div>

          <div>
            <label htmlFor="design-inclusions" className="input-label">
              Inclusions <span className="text-navy-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="design-inclusions"
              type="text"
              placeholder="Fresh flowers, LED lights, Backdrop cloth, Balloon arch"
              className="input-field"
              {...register("inclusions")}
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary w-full py-3.5 justify-center"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" />Saving...</> : <><Save size={18} />{isEdit ? "Save Changes" : "Add Design"}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
