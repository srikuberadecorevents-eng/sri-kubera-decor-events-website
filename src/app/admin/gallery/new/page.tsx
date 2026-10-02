import type { Metadata } from "next";
import DesignForm from "../DesignForm";

export const metadata: Metadata = { title: "Add Design" };

export default function NewDesignPage() {
  return <DesignForm />;
}
