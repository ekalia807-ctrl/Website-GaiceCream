import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { testimonialFromRow } from "@/lib/supabase/mappers";
import type { Testimonial } from "@/types/product";
import { PUBLIC_DATA_TAG } from "./tags";

/**
 * Testimoni aktif untuk bagian "Kata mereka" di Home. Ditambah lewat dashboard admin > Testimoni.
 * Jika tabelnya belum dibuat (migrasi 0005 belum dijalankan), Home tetap tampil normal tanpa bagian ini.
 */
export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) return [];
    return (data ?? []).map(testimonialFromRow);
  },
  ["public-testimonials"],
  { revalidate: 60, tags: [PUBLIC_DATA_TAG] },
);
