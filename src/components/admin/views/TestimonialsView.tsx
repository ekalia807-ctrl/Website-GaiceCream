"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAdminTestimonials, useTestimonialsReady } from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/product";
import { AdminTitle } from "../AdminTitle";
import { AdminLoading, EmptyState } from "../EmptyState";
import { TestimonialFormModal } from "../TestimonialFormModal";
import { useToast } from "../ToastProvider";

export function TestimonialsView() {
  const ready = useTestimonialsReady();
  const notify = useToast();
  const items = useAdminTestimonials();
  const [target, setTarget] = useState<{ item?: Testimonial } | null>(null);

  if (!ready) return <AdminLoading />;

  // simpan hanya id agar modal selalu menampilkan data terbaru
  const editing = target?.item ? items.find((item) => item.id === target.item?.id) : undefined;

  return (
    <div>
      <AdminTitle eyebrow="Kata pelanggan" title="Testimoni">
        <Button type="button" onClick={() => setTarget({})}>
          <Plus size={16} strokeWidth={1.8} aria-hidden="true" /> Tambah Testimoni
        </Button>
      </AdminTitle>

      <p className="mb-[18px] max-w-[560px] text-[12px] leading-[1.7] text-muted">
        Testimoni yang aktif tampil di bagian &quot;Kata mereka&quot; di beranda (maksimal 6, yang terbaru lebih dulu).
      </p>

      {items.length === 0 ? (
        <EmptyState>Belum ada testimoni. Klik Tambah Testimoni.</EmptyState>
      ) : (
        <section className="grid grid-cols-2 gap-[16px] max-[800px]:grid-cols-1">
          {items.map((item) => (
            <article key={item.id} className="rounded-[18px] border border-[#eeeceb] bg-white p-[18px]">
              <span
                className={cn(
                  "inline-block rounded-full px-[8px] py-[5px] text-[9px] font-semibold",
                  item.active ? "bg-[#e3efdf] text-[#557a4b]" : "bg-[#eeeae6] text-[#6e625e]",
                )}
              >
                {item.active ? "Tampil" : "Disembunyikan"}
              </span>
              <p className="mb-[14px] mt-[12px] text-[13px] leading-[1.7]">“{item.quote}”</p>
              <div className="flex items-end justify-between gap-[10px]">
                <div className="flex flex-col">
                  <b className="text-[12px]">{item.name}</b>
                  {item.role && <small className="text-[10px] text-muted">{item.role}</small>}
                </div>
                <button
                  type="button"
                  onClick={() => setTarget({ item })}
                  className="rounded-[8px] bg-[#fff1f5] px-[9px] py-[6px] text-[10px] text-[#b15f78]"
                >
                  Edit
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {target && (target.item ? editing : true) && (
        <TestimonialFormModal
          key={editing?.id ?? "new"}
          testimonial={editing}
          onClose={() => setTarget(null)}
          onSaved={notify}
        />
      )}
    </div>
  );
}
