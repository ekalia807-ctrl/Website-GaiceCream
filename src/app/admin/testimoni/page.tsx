import type { Metadata } from "next";
import { TestimonialsView } from "@/components/admin/views/TestimonialsView";

export const metadata: Metadata = { title: "Testimoni" };

export default function Page() {
  return <TestimonialsView />;
}
