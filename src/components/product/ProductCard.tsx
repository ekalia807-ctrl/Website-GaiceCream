import Image from "next/image";
import Link from "next/link";
import { FloatingProduct } from "@/components/ui/FloatingProduct";
import { floatingImage } from "@/lib/floating";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/types/product";

const detailClass =
  "border-b border-transparent text-[11px] uppercase tracking-[.14em] text-muted hover:border-chocolate hover:text-chocolate";

export function ProductCard({
  product,
  detailHref,
  onDetail,
  floating = false,
}: {
  product: Product;
  /** dipakai di Home: tautan ke katalog */
  detailHref?: string;
  /** dipakai di Katalog: membuka modal detail */
  onDetail?: () => void;
  /** tampilkan foto tanpa latar yang melayang (dipakai di Home) */
  floating?: boolean;
}) {
  const soldOut = product.stock <= 0;
  const cutout = floating ? floatingImage(product.name) : null;
  const badge =
    product.tag || soldOut ? (
      <span className="absolute left-[8px] top-[8px] bg-white px-[8px] py-[4px] text-[9px] font-medium uppercase tracking-[.14em] text-chocolate">
        {soldOut ? "Stok habis" : product.tag}
      </span>
    ) : null;

  return (
    <article className="flex flex-col">
      {cutout ? (
        <div className="relative flex aspect-square items-center justify-center">
          <FloatingProduct
            src={cutout}
            alt={`Gabin es krim ${product.name}`}
            sizes="(max-width: 800px) 40vw, 26vw"
            rotate={-3}
            lift={8}
            duration={5.8}
            className="w-[76%]"
          />
          {badge}
        </div>
      ) : (
        <div className="relative aspect-square overflow-hidden bg-vanilla">
          <Image
            src={product.image}
            alt={`Gabin es krim ${product.name}`}
            fill
            sizes="(max-width: 800px) 50vw, 33vw"
            className="object-cover"
          />
          {badge}
        </div>
      )}

      <div className="flex flex-1 flex-col pt-[12px]">
        <small className="text-[10px] uppercase tracking-[.16em] text-muted">{product.category}</small>
        <h3 className="mt-[3px] text-[17px] font-normal leading-[1.25] max-[520px]:text-[15px]">{product.name}</h3>
        <p className="mt-[4px] line-clamp-2 min-h-[40px] text-[12px] leading-[1.6] text-muted max-[520px]:hidden">
          {product.description}
        </p>
        <strong className="mt-[8px] text-[14px] font-medium">{formatIDR(product.price)}</strong>

        <div className="mt-[12px] flex items-center justify-between gap-[8px]">
          {onDetail ? (
            <button type="button" onClick={onDetail} className={detailClass}>
              Detail
            </button>
          ) : detailHref ? (
            <Link href={detailHref} className={detailClass}>
              Detail
            </Link>
          ) : (
            <span />
          )}
          {soldOut ? (
            <span className="text-[11px] uppercase tracking-[.14em] text-[#a8a29e]">Habis</span>
          ) : (
            <Link
              href={`/pesan?rasa=${product.id}`}
              aria-label={`Pesan ${product.name}`}
              className="min-h-[40px] border border-chocolate px-[14px] py-[10px] text-[11px] font-medium uppercase tracking-[.14em] hover:bg-chocolate hover:text-white"
            >
              Pesan
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}