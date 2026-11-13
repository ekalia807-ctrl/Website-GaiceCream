import { slugify } from "@/lib/utils";

/**
 * Foto produk tanpa latar (transparan) untuk tampilan "melayang".
 * File ada di public/images/floating/<slug-nama-rasa>.webp.
 * Rasa yang belum punya foto transparan otomatis memakai foto aslinya.
 */
const FLOATING_SLUGS = new Set([
  "cookies-cream",
  "chocolate-milo",
  "matcha",
  "blueberry",
  "strawberry",
]);

export function floatingImage(productName: string): string | null {
  const slug = slugify(productName);
  return FLOATING_SLUGS.has(slug) ? `/images/floating/${slug}.webp` : null;
}
