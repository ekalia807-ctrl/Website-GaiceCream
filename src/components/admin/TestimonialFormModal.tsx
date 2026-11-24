"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { newId, testimonialsStore } from "@/lib/admin/repository";
import { testimonialFormSchema, type TestimonialFormValues } from "@/lib/validation/admin";
import type { Testimonial } from "@/types/product";
import { Modal } from "./Modal";
import { adminError, adminInput, adminLabel } from "./styles";

export function TestimonialFormModal({
  testimonial,
  onClose,
  onSaved,
}: {
  testimonial?: Testimonial;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          role: testimonial.role,
          quote: testimonial.quote,
          active: testimonial.active,
        }
      : { name: "", role: "", quote: "", active: true },
  });

  const onSubmit = handleSubmit((values) => {
    if (testimonial) {
      testimonialsStore.update(testimonial.id, values);
      onSaved("Testimoni diperbarui");
    } else {
      // testimoni baru tampil paling depan
      const lowest = Math.min(0, ...testimonialsStore.getSnapshot().map((item) => item.sortOrder));
      testimonialsStore.add({ id: newId(), ...values, sortOrder: lowest - 1 });
      onSaved("Testimoni ditambahkan");
    }
    onClose();
  });

  function remove() {
    if (!testimonial) return;
    if (window.confirm(`Hapus testimoni dari ${testimonial.name}?`)) {
      testimonialsStore.remove(testimonial.id);
      onSaved("Testimoni dihapus");
      onClose();
    }
  }

  return (
    <Modal title={testimonial ? "Edit testimoni" : "Tambah testimoni"} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <label className={adminLabel}>
          Nama pelanggan
          <input
            {...register("name")}
            placeholder="Contoh: Rina"
            aria-invalid={Boolean(errors.name)}
            className={adminInput}
          />
          {errors.name && <span className={adminError}>{errors.name.message}</span>}
        </label>
        <label className={adminLabel}>
          Keterangan (opsional)
          <input
            {...register("role")}
            placeholder="Contoh: Pelanggan setia, Mataram"
            aria-invalid={Boolean(errors.role)}
            className={adminInput}
          />
          {errors.role && <span className={adminError}>{errors.role.message}</span>}
        </label>
        <label className={adminLabel}>
          Isi testimoni
          <textarea
            {...register("quote")}
            rows={4}
            placeholder="Tulis kata-kata pelanggan apa adanya"
            aria-invalid={Boolean(errors.quote)}
            className={`${adminInput} resize-y`}
          />
          {errors.quote && <span className={adminError}>{errors.quote.message}</span>}
        </label>
        <label className="mt-[16px] flex items-center gap-[8px] text-[12px]">
          <input type="checkbox" {...register("active")} className="h-[16px] w-[16px]" />
          Tampilkan di website
        </label>
        <Button type="submit" full className="mt-[20px]">
          Simpan Testimoni
        </Button>
        {testimonial && (
          <button
            type="button"
            onClick={remove}
            className="mt-[10px] w-full rounded-[11px] border border-[#efc9c2] py-[11px] text-[12px] text-[#a8493a]"
          >
            Hapus testimoni
          </button>
        )}
      </form>
    </Modal>
  );
}
