import type { Metadata } from "next";
import ContactClientPage from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Sri Kubera Decor & Events in Puducherry. Reach us by phone, WhatsApp, or the contact form.",
};

export default function ContactPage() {
  return <ContactClientPage />;
}
