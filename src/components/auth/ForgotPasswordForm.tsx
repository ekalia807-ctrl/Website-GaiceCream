"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { errorClass, inputClass, labelClass } from "@/components/ui/formStyles";
import { createClient } from "@/lib/supabase/client";
import { forgotSchema, type ForgotValues } from "@/lib/validation/auth";

export function ForgotPasswordForm({ initialError }: { initialError?: string }) {
  const [formError, setFormError] = useState(initialError ?? "");
  const [sentTo, setSentTo] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    const { error } = await createClient().auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setFormError(
        /rate limit|too many/i.test(error.message)
          ? "Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi."
          : "Belum bisa mengirim email. Coba lagi sebentar lagi.",
      );
      return;
    }
    setSentTo(values.email);
  });

  if (sentTo) {
    return (
      <div className="text-center">
        <p className="text-[14px] leading-[1.7]">
          Jika <b>{sentTo}</b> terdaftar, kami sudah mengirim tautan untuk membuat password baru.
        </p>
        <p className="mt-[10px] text-[12px] leading-[1.7] text-muted">
          Cek kotak masuk dan folder spam. Tautannya hanya berlaku sebentar.
        </p>
        <Link href="/masuk" className="mt-[20px] inline-block text-[12px] font-medium text-chocolate underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="text-[12px] leading-[1.7] text-muted">
        Masukkan email akunmu. Kami kirim tautan untuk membuat password baru.
      </p>
      <label className={labelClass}>
        Email
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClass}
        />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}
      </label>

      {formError && (
        <p role="alert" className={`${errorClass} mt-[14px]`}>
          {formError}
        </p>
      )}

      <Button type="submit" full disabled={isSubmitting} className="mt-[22px]">
        {isSubmitting ? "Mengirim..." : "Kirim tautan"}
      </Button>
      <p className="mt-[18px] text-center text-[12px] text-muted">
        Ingat password?{" "}
        <Link href="/masuk" className="font-medium text-chocolate underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}