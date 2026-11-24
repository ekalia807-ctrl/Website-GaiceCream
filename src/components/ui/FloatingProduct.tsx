import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** ukuran gambar yang dipakai Next.js untuk memilih resolusi */
  sizes: string;
  /** putaran dasar (derajat) agar tampak natural, bukan lurus seperti kotak */
  rotate?: number;
  /** seberapa tinggi melayang (px) */
  lift?: number;
  /** durasi satu putaran melayang (detik) */
  duration?: number;
  /** jeda awal (detik) supaya tiap produk tidak bergerak serempak */
  delay?: number;
  priority?: boolean;
  /**
   * Kelas untuk posisi dan lebar (mis. "absolute left-[10%] top-[5%] w-[40%]").
   * Dipasang di pembungkus luar, jadi tidak bentrok dengan kelas posisi internal.
   */
  className?: string;
};

/**
 * Foto produk tanpa latar yang melayang pelan, lengkap dengan bayangan lembut di bawahnya.
 * Gerakannya murni CSS (tanpa JavaScript) jadi ringan di HP.
 */
export function FloatingProduct({
  src,
  alt,
  sizes,
  rotate = 0,
  lift = 12,
  duration = 6,
  delay = 0,
  priority = false,
  className,
}: Props) {
  const vars = {
    "--gai-rot": `${rotate}deg`,
    "--gai-lift": `${lift}px`,
    "--gai-dur": `${duration}s`,
    "--gai-delay": `${delay}s`,
    "--gai-tilt": `${rotate >= 0 ? 2 : -2}deg`,
  } as React.CSSProperties;

  return (
    // pembungkus luar: hanya posisi + lebar (dari className)
    <div className={className} style={vars}>
      {/* pembungkus dalam: tempat gambar, bayangan, dan animasi */}
      <div className="relative w-full">
        <div className="gai-float relative aspect-[1.2/1] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-contain drop-shadow-[0_14px_14px_rgba(80,45,30,.18)]"
          />
        </div>
        <span
          aria-hidden="true"
          className="gai-float-shadow pointer-events-none absolute -bottom-[7%] left-[14%] h-[8%] w-[72%] rounded-[50%] bg-[#4a2c20] blur-[10px]"
        />
      </div>
    </div>
  );
}
