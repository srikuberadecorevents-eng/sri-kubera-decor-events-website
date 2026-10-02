import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  IndianRupee,
  CheckCircle,
  MessageCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("designs")
    .select("title, description")
    .eq("id", id)
    .single();

  return {
    title: data?.title || "Design Detail",
    description: data?.description || "View this design and raise an enquiry.",
  };
}

export default async function DesignDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: design } = await supabase
    .from("designs")
    .select("*, categories(id, name, created_at)")
    .eq("id", id)
    .single();

  if (!design) notFound();

  const inclusions = design.inclusions
    ? design.inclusions.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card-hover">
            <Image
              src={design.image_url}
              alt={design.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {(design as any).categories && (
              <span className="absolute top-4 left-4 badge bg-navy-900/80 text-cream-100 backdrop-blur-sm">
                {(design as any).categories.name}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-3">
              {design.title}
            </h1>

            {design.price && (
              <div className="flex items-center gap-1.5 text-2xl font-bold text-gold-600 mb-4">
                <IndianRupee size={22} />
                <span>{Number(design.price).toLocaleString("en-IN")}</span>
              </div>
            )}

            {design.description && (
              <p className="text-navy-600 leading-relaxed mb-6">{design.description}</p>
            )}

            {inclusions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-navy-800 mb-3 text-sm uppercase tracking-wide">
                  What&apos;s Included
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inclusions.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-navy-600">
                      <CheckCircle size={15} className="text-gold-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-navy-400 mb-8">
              <Calendar size={13} />
              Added {new Date(design.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="mt-auto space-y-3">
              <EnquireButton designId={design.id} designTitle={design.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side enquire button that checks auth
async function EnquireButton({
  designId,
  designTitle,
}: {
  designId: string;
  designTitle: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href={`/login?redirectTo=/gallery/${designId}`}
        className="btn-primary w-full text-center text-base py-4"
      >
        Login to Enquire About This Design
      </Link>
    );
  }

  return (
    <Link
      href={`/gallery/${designId}/enquire`}
      className="btn-primary w-full text-center text-base py-4"
    >
      <MessageCircle size={18} />
      Enquire This Design
    </Link>
  );
}
