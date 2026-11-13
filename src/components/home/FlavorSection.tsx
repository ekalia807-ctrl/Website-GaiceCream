import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FloatingProduct } from "@/components/ui/FloatingProduct";
import { floatingImage } from "@/lib/floating";
import { capitalize, countWord } from "@/lib/utils";
import type { Product } from "@/types/product";

export function FlavorSection({
  products,
  totalFlavors,
}: {
  products: Product[];
  totalFlavors: number;
}) {
  const word = countWord(totalFlavors);

  return (
    <section className="bg-vanilla px-[max(6vw,20px)] py-[56px] min-[801px]:py-[84px]">
      <div className="mx-auto mb-[32px] max-w-[560px] text-center">
        <Eyebrow centered>Temukan favoritmu</Eyebrow>
        <h2 className="text-[clamp(26px,3.4vw,40px)] font-light leading-[1.12] tracking-[-.02em]">
          {capitalize(word)} rasa, {word} cara untuk bahagia.
        </h2>
        <p className="mt-[14px] text-[14px] leading-[1.8] text-muted">
          Dari matcha yang lembut sampai cokelat yang pekat, ada satu rasa yang pas untuk setiap suasana hatimu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-[12px] gap-y-[34px] min-[801px]:grid-cols-4 min-[801px]:gap-x-[20px]">
        {products.map((product, index) => {
          const cutout = floatingImage(product.name);
          return (
            <Link
              key={product.id}
              href="/katalog"
              aria-label={`Lihat ${product.name} di katalog`}
              className="group block pb-[6px] transition-transform duration-300 hover:-translate-y-[6px]"
            >
              {cutout ? (
                <FloatingProduct
                  src={cutout}
                  alt=""
                  sizes="(max-width: 800px) 45vw, 22vw"
                  rotate={index % 2 === 0 ? -4 : 4}
                  lift={9}
                  duration={5.4 + index * 0.5}
                  delay={index * 0.6}
                  className="mx-auto w-[92%] pt-[10px]"
                />
              ) : (
                <div className="relative aspect-[1.2/1] w-full">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="(max-width: 800px) 45vw, 22vw"
                    className="object-contain"
                  />
                </div>
              )}
              <span className="mt-[22px] block text-center text-[12px] uppercase tracking-[.14em]">
                {product.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-[34px] flex justify-center">
        <ButtonLink href="/katalog" variant="secondary">
          Eksplor semua rasa
        </ButtonLink>
      </div>
    </section>
  );
}
