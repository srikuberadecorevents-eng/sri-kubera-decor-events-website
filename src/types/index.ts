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
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Design {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  image_url: string;
  price?: number;
  inclusions?: string;
  created_at: string;
  categories?: Category;
}

export type BookingStatus = "pending" | "contacted" | "confirmed" | "rejected";

export interface Booking {
  id: string;
  enquiry_id: string;
  user_id: string;
  design_id?: string;
  status: BookingStatus;
  booking_date: string;
  admin_notes?: string;
  designs?: Design;
  profiles?: Profile;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface BusinessSettings {
  id: number;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  map_link?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}
