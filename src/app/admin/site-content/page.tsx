"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Sparkles,
  GripVertical,
  Megaphone,
  BarChart3,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/clientImageUpload";
import toast from "react-hot-toast";

interface HeroSlide {
  id: string;
  image_url: string;
  headline: string;
  subheadline: string;
}

export default function AdminSiteContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Hero Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    {
      id: "slide-1",
      image_url: "/assets/25000.jpeg",
      headline: "Crafting Unforgettable Moments",
      subheadline: "Puducherry's Premier Stage & Event Decorators",
    },
  ]);
  const [slideUploadingIndex, setSlideUploadingIndex] = useState<number | null>(
    null
  );

  // 2. About section
  const [aboutText, setAboutText] = useState(
    "With over a decade of excellence in Puducherry, Sri Kubera Decor & Events transforms weddings, receptions, birthdays, and corporate celebrations into royal spectacles."
  );
  const [proprietor, setProprietor] = useState("Saravanan");
  const [yearsInBusiness, setYearsInBusiness] = useState("12");

  // 3. Stats section
  const [eventsDone, setEventsDone] = useState("1500");
  const [happyCustomers, setHappyCustomers] = useState("1400");

  // 4. Announcement Bar
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const { data } = await supabase.from("site_content").select("*");
        if (data) {
          data.forEach((row) => {
            if (row.key === "hero_slides" && Array.isArray(row.value)) {
              setHeroSlides(row.value);
            }
            if (row.key === "about" && row.value) {
              if (row.value.text) setAboutText(row.value.text);
              if (row.value.proprietor) setProprietor(row.value.proprietor);
              if (row.value.years_in_business !== undefined)
                setYearsInBusiness(row.value.years_in_business.toString());
            }
            if (row.key === "stats" && row.value) {
              if (row.value.events_done !== undefined)
                setEventsDone(row.value.events_done.toString());
              if (row.value.happy_customers !== undefined)
                setHappyCustomers(row.value.happy_customers.toString());
            }
            if (row.key === "announcement" && row.value) {
              setAnnouncementText(row.value.text || "");
              setAnnouncementActive(Boolean(row.value.is_active));
            }
          });
        }
      } catch (err) {
        console.error("Load site_content error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  // Slide photo upload
  const handleSlideImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlideUploadingIndex(index);
    try {
      const result = await compressAndUploadImage(file);
      setHeroSlides((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], image_url: result.url_full };
        return copy;
      });
      toast.success("Slide photograph uploaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload slide image");
    } finally {
      setSlideUploadingIndex(null);
    }
  };

  const addSlide = () => {
    if (heroSlides.length >= 5) {
      toast.error("Maximum 5 hero slides allowed");
      return;
    }
    setHeroSlides((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        image_url: "/assets/25000.jpeg",
        headline: "Royal Stage Decor",
        subheadline: "Tailored to Your Celebration",
      },
    ]);
  };

  const removeSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      toast.error("At least 1 hero slide is required");
      return;
    }
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  };

  // Save all site content
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          key: "hero_slides",
          value: heroSlides,
          updated_at: new Date().toISOString(),
        },
        {
          key: "about",
          value: {
            text: aboutText.trim(),
            proprietor: proprietor.trim(),
            years_in_business: yearsInBusiness ? parseInt(yearsInBusiness, 10) : null,
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: "stats",
          value: {
            events_done: eventsDone ? parseInt(eventsDone, 10) : null,
            happy_customers: happyCustomers ? parseInt(happyCustomers, 10) : null,
            years: yearsInBusiness ? parseInt(yearsInBusiness, 10) : null,
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: "announcement",
          value: {
            text: announcementText.trim(),
            is_active: announcementActive,
          },
          updated_at: new Date().toISOString(),
        },
      ];

      for (const item of updates) {
        await supabase.from("site_content").upsert(item as any);
      }

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/"]);

      toast.success("Site content saved successfully");
    } catch (err) {
      console.error("Save site content error:", err);
      toast.error("Failed to save site content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={32} className="animate-spin text-[#0B4A3A] mx-auto mb-2" />
        <p className="text-xs text-[#5D6D67]">Loading website content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Website Content
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Edit homepage hero slides, proprietor about info, verified stats, and announcement bar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#C9A24B]" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={16} />
              Save All Content
            </>
          )}
        </button>
      </div>

      {/* 1. Announcement Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-[#0B4A3A]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
              Top Announcement Bar
            </h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A]"
            />
            <span className="text-xs font-medium text-[#17211E]">
              {announcementActive ? "Active (Shown)" : "Hidden"}
            </span>
          </label>
        </div>

        <div>
          <label htmlFor="announcement-input" className="block text-xs text-[#5D6D67] mb-1">
            Announcement Message
          </label>
          <input
            id="announcement-input"
            type="text"
            placeholder="e.g. Special festive booking discount: Book stage decor before Oct 30 and get complimentary entrance arch!"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            disabled={!announcementActive}
            className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] disabled:opacity-50"
          />
        </div>
      </div>

      {/* 2. Hero Slides */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
              Homepage Hero Slides ({heroSlides.length}/5)
            </h2>
            <p className="text-[11px] text-[#5D6D67]">
              Main banner photos with headline titles shown on the landing page.
            </p>
          </div>

          {heroSlides.length < 5 && (
            <button
              type="button"
              onClick={addSlide}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF6EC] hover:bg-[#E8E2D5] text-[#0B4A3A] flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              Add Slide
            </button>
          )}
        </div>

        <div className="space-y-4">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/30 flex flex-col md:flex-row gap-4 items-start"
            >
              {/* Photo Preview & Replace */}
              <div className="relative w-full md:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-[#E8E2D5] shrink-0">
                <Image
                  src={slide.image_url}
                  alt={`Slide ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <label
                  htmlFor={`slide-upload-${idx}`}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs"
                >
                  {slideUploadingIndex === idx ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} className="mb-1" />
                      <span>Change Photo</span>
                    </>
                  )}
                </label>
                <input
                  id={`slide-upload-${idx}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSlideImageUpload(idx, e)}
                  disabled={slideUploadingIndex !== null}
                />
              </div>

              {/* Text Inputs */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B4A3A] uppercase tracking-wider">
                    Slide #{idx + 1}
                  </span>
                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={slide.headline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeroSlides((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], headline: val };
                        return copy;
                      });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211E] mb-1">
                    Subheadline
                  </label>
                  <input
                    type="text"
                    value={slide.subheadline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeroSlides((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], subheadline: val };
                        return copy;
                      });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. About & Proprietor Details */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
          About Sri Kubera &amp; Leadership
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="proprietor-input" className="block text-xs text-[#5D6D67] mb-1">
              Proprietor / Founder Name
            </label>
            <input
              id="proprietor-input"
              type="text"
              value={proprietor}
              onChange={(e) => setProprietor(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>

          <div>
            <label htmlFor="years-input" className="block text-xs text-[#5D6D67] mb-1">
              Years in Business
            </label>
            <input
              id="years-input"
              type="number"
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="about-text-input" className="block text-xs text-[#5D6D67] mb-1">
            About Company Bio
          </label>
          <textarea
            id="about-text-input"
            rows={3}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
          />
        </div>
      </div>

      {/* 4. Verified Numerical Stats */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
            Key Verified Milestones (Stats)
          </h2>
          <p className="text-[11px] text-[#5D6D67] mt-1">
            Leave blank if not applicable; the public site only displays numbers you explicitly provide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="events-done-input" className="block text-xs text-[#5D6D67] mb-1">
              Total Events Executed
            </label>
            <input
              id="events-done-input"
              type="number"
              placeholder="e.g. 1500"
              value={eventsDone}
              onChange={(e) => setEventsDone(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>

          <div>
            <label htmlFor="happy-cust-input" className="block text-xs text-[#5D6D67] mb-1">
              Happy Families / Clients
            </label>
            <input
              id="happy-cust-input"
              type="number"
              placeholder="e.g. 1400"
              value={happyCustomers}
              onChange={(e) => setHappyCustomers(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
