import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteDesignButton from "./DeleteDesignButton";

export const metadata: Metadata = { title: "Manage Gallery" };

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: designs } = await supabase
    .from("designs")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900">Gallery</h1>
          <p className="text-navy-500 text-sm mt-1">{designs?.length || 0} designs</p>
        </div>
        <Link href="/admin/gallery/new" className="btn-primary">
          <Plus size={16} />
          Add Design
        </Link>
      </div>

      {!designs?.length ? (
        <div className="card p-12 text-center">
          <p className="text-navy-400 text-sm mb-4">No designs added yet.</p>
          <Link href="/admin/gallery/new" className="btn-primary">
            Add First Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-cream-200">
                <Image
                  src={design.image_url}
                  alt={design.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {(design as any).categories && (
                  <span className="absolute top-2 left-2 badge bg-navy-900/80 text-cream-100 text-xs">
                    {(design as any).categories.name}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-navy-900 text-sm mb-1 line-clamp-1">{design.title}</h3>
                {design.price && (
                  <p className="text-gold-600 text-xs font-semibold mb-3">
                    Rs. {Number(design.price).toLocaleString("en-IN")}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/gallery/${design.id}/edit`}
                    className="flex-1 btn-outline text-xs py-2 justify-center"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <DeleteDesignButton designId={design.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
