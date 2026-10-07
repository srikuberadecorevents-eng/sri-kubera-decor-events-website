export type UserRole = "admin" | "user";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email: string;
  gender?: "male" | "female";
  address?: string;
  pincode?: string;
  created_at: string;
  bookings?: { id: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug?: string | null;
  sort_order?: number;
  cover_url?: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface Media {
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
  used_count?: number;
}

export interface DesignImage {
  id: string;
  design_id: string;
  media_id: string;
  alt?: string | null;
  sort_order: number;
  is_cover: boolean;
  media?: Media;
}

export type DesignStatus = "draft" | "published" | "archived";

export interface Design {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  category_id?: string | null;
  image_url: string;
  price?: number | null;
  price_on_request?: boolean;
  inclusions?: string | null;
  inclusions_list?: string[];
  status?: DesignStatus;
  is_featured?: boolean;
  sort_order?: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
  categories?: Category | null;
  design_images?: DesignImage[];
}

export type BookingStatus = "pending" | "contacted" | "confirmed" | "rejected";

export interface BookingPrivate {
  booking_id: string;
  internal_notes?: string | null;
  quoted_price?: number | null;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  from_status?: string | null;
  to_status: BookingStatus;
  note?: string | null;
  changed_by?: string | null;
  changed_at: string;
  profiles?: Profile | null;
}

export interface Booking {
  id: string;
  enquiry_id: string;
  user_id: string;
  design_id?: string | null;
  status: BookingStatus;
  booking_date: string;
  event_date?: string | null;
  venue?: string | null;
  admin_notes?: string | null;
  updated_at?: string;
  designs?: Design | null;
  profiles?: Profile | null;
  booking_private?: BookingPrivate | null;
  booking_status_history?: BookingStatusHistory[];
}

export type RequirementStatus = "new" | "contacted" | "converted" | "closed";

export interface Requirement {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  event_type?: string | null;
  event_date?: string | null;
  place: string;
  message?: string | null;
  status: RequirementStatus;
  admin_notes?: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  event_type?: string | null;
  quote: string;
  rating?: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface HeroSlide {
  media_id?: string;
  image_url: string;
  headline: string;
  subheadline?: string;
}

export interface SiteContent {
  key: string;
  value: any;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  summary?: string | null;
  created_at: string;
  profiles?: Profile | null;
}

export interface Service {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at: string;
}

export interface BusinessSettings {
  id: number;
  phone?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  map_link?: string | null;
  working_hours?: string | null;
  notification_email?: string | null;
  tagline?: string | null;
  social_links?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  } | null;
}
