import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FloatingProduct } from "@/components/ui/FloatingProduct";
import { formatIDR } from "@/lib/utils";

/**
 * Susunan foto produk melayang. Posisi dalam persen dari kotak komposisi,
 * jadi otomatis menyesuaikan di HP maupun desktop.
 */
const cluster = [
  { slug: "strawberry",     name: "Strawberry",      pos: "left-[0%] top-[14%] w-[30%] z-20",   rotate: -11, lift: 9,  duration: 6.1, delay: 0.8 },
  { slug: "cookies-cream",  name: "Cookies & Cream", pos: "left-[44%] top-[1%] w-[24%] z-10",   rotate: 13,  lift: 12, duration: 7.9, delay: 1.1 },
  { slug: "matcha",         name: "Matcha",          pos: "right-[0%] top-[27%] w-[42%] z-30",  rotate: 4,   lift: 11, duration: 7.2, delay: 0 },
  { slug: "blueberry",      name: "Blueberry",       pos: "left-[9%] top-[57%] w-[30%] z-20",   rotate: 7,   lift: 8,  duration: 5.7, delay: 1.7 },
  { slug: "chocolate-milo", name: "Chocolate Milo",  pos: "left-[52%] top-[79%] w-[26%] z-20",  rotate: -9,  lift: 10, duration: 6.6, delay: 0.4 },
] as const;

export function Hero({ minPrice }: { minPrice: number }) {
  return (
    <section className="grid items-center gap-[20px] overflow-x-clip bg-vanilla px-[max(6vw,20px)] pb-[40px] pt-[16px] min-[801px]:grid-cols-2 min-[801px]:gap-[70px] min-[801px]:py-[40px]">
      <div className="mx-auto w-full max-w-[560px] max-[800px]:order-1 max-[800px]:text-center">
        <Eyebrow className="max-[800px]:justify-center">Sweet, creamy &amp; crunchy</Eyebrow>
        <h1 className="text-[clamp(34px,5vw,62px)] font-light leading-[1.06] tracking-[-.025em]">
          A little crunch,
          <br />
          a lot of happiness.
        </h1>
        <p className="mt-[20px] max-w-[470px] text-[15px] leading-[1.8] text-muted max-[800px]:mx-auto">
          Gabin renyah dengan isian es krim creamy aneka rasa. Dibuat fresh untuk menemani setiap momen manismu.
        </p>
        <p className="mt-[14px] text-[12px] uppercase tracking-[.16em] text-biscuit">
          Mulai dari {formatIDR(minPrice)}
        </p>
        <div className="mt-[28px] flex gap-[12px] max-[520px]:flex-col min-[801px]:justify-start max-[800px]:justify-center">
          <ButtonLink href="/pesan">
            Pesan Sekarang <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/katalog" variant="secondary">
            Lihat Katalog
          </ButtonLink>
        </div>
      </div>

      {/* foto produk tanpa latar, melayang */}
      <div className="relative mx-auto aspect-[1/1.1] w-full max-w-[400px] min-[801px]:max-w-[640px] max-[800px]:order-2 max-[800px]:max-w-[270px]">
        {cluster.map((item, index) => (
          <FloatingProduct
            key={item.slug}
            src={`/images/floating/${item.slug}.webp`}
            alt={`Gabin es krim ${item.name}`}
            sizes="(max-width: 800px) 150px, 220px"
            rotate={item.rotate}
            lift={item.lift}
            duration={item.duration}
            delay={item.delay}
            priority={index < 3}
            className={`absolute ${item.pos}`}
          />
        ))}
      </div>
    </section>
  );
}