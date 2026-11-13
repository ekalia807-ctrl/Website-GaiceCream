import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FloatingProduct } from "@/components/ui/FloatingProduct";

export const metadata: Metadata = { title: "Tentang Kami" };

export default function AboutPage() {
  return (
    <main className="min-h-[70vh]">
      <section className="grid items-center gap-[36px] px-[max(6vw,20px)] py-[48px] min-[801px]:grid-cols-2 min-[801px]:gap-[70px] min-[801px]:py-[80px]">
        <div>
          <Eyebrow>Our sweet story</Eyebrow>
          <h1 className="text-[clamp(28px,3.8vw,46px)] font-light leading-[1.12] tracking-[-.02em]">
            Dari dapur kecil,
            <br />
            untuk senyum yang besar.
          </h1>
          <p className="mt-[18px] max-w-[520px] text-[15px] leading-[1.85] text-muted">
            GAICREAM lahir dari ide sederhana: menghadirkan kembali rasa nostalgia biskuit gabin dengan cara yang lebih seru, creamy, dan penuh warna.
          </p>
          <ButtonLink href="/katalog" className="mt-[26px]">
            Kenali rasa kami <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </ButtonLink>
        </div>

        {/* foto produk tanpa latar, melayang */}
        <div className="relative mx-auto aspect-[1/1] w-full max-w-[480px] max-[800px]:max-w-[340px]">
          <FloatingProduct
            src="/images/floating/strawberry.webp"
            alt="Gabin es krim Strawberry"
            sizes="(max-width: 500px) 190px, 270px"
            rotate={-6}
            lift={11}
            duration={6}
            priority
            className="absolute left-[-42%] top-[3%] z-10 w-[56%]"
          />
          <FloatingProduct
            src="/images/floating/cookies-cream.webp"
            alt="Gabin es krim Cookies & Cream"
            sizes="(max-width: 500px) 190px, 270px"
            rotate={7}
            lift={12}
            duration={5.5}
            delay={0.9}
            priority
            className="absolute right-[-33%] top-[27%] z-20 w-[58%]"
          />
          <FloatingProduct
            src="/images/floating/matcha.webp"
            alt="Gabin es krim Matcha"
            sizes="(max-width: 500px) 180px, 250px"
            rotate={-3}
            lift={10}
            duration={6.6}
            delay={1.5}
            className="absolute bottom-[72%] left-[60%] z-10 w-[52%]"
          />
        </div>
      </section>

      <section className="grid gap-[36px] border-t border-line bg-vanilla px-[max(6vw,20px)] py-[56px] min-[801px]:grid-cols-2 min-[801px]:gap-[90px] min-[801px]:py-[84px]">
        <article>
          <small className="text-[11px] font-medium uppercase tracking-[.22em] text-muted">Visi kami</small>
          <h2 className="my-[12px] text-[24px] font-light leading-[1.25]">Menjadi teman manis di setiap momen.</h2>
          <p className="leading-[1.8] text-muted">
            Menghadirkan dessert lokal yang berkualitas, mudah dinikmati, dan selalu memberi kebahagiaan sederhana.
          </p>
        </article>
        <article>
          <small className="text-[11px] font-medium uppercase tracking-[.22em] text-muted">Misi kami</small>
          <h2 className="my-[12px] text-[24px] font-light leading-[1.25]">Fresh, fun, dan dibuat dengan hati.</h2>
          <p className="leading-[1.8] text-muted">
            Kami memilih bahan terbaik, menjaga konsistensi rasa, dan terus menciptakan varian baru untuk semua pencinta dessert.
          </p>
        </article>
      </section>
    </main>
  );
}
