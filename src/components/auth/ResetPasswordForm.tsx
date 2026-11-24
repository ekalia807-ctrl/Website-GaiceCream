"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { errorClass, inputClass, labelClass } from "@/components/ui/formStyles";
import { createClient } from "@/lib/supabase/client";
import { resetSchema, type ResetValues } from "@/lib/validation/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(
        /different from the old password|same/i.test(error.message)
          ? "Password baru harus berbeda dari password lama."
          : "Belum bisa mengubah password. Tautannya mungkin sudah kedaluwarsa, minta tautan baru.",
      );
      return;
    }
    // keluar dulu, lalu masuk lagi dengan password baru
    await supabase.auth.signOut();
    router.replace("/masuk?info=password-diubah");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <label className={labelClass}>
        Password baru
        <input
          {...register("password")}
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          className={inputClass}
        />
        {errors.password && <span className={errorClass}>{errors.password.message}</span>}
      </label>
      <label className={labelClass}>
        Ulangi password baru
        <input
          {...register("confirmPassword")}
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClass}
        />
        {errors.confirmPassword && <span className={errorClass}>{errors.confirmPassword.message}</span>}
      </label>

      {formError && (
        <p role="alert" className={`${errorClass} mt-[14px]`}>
          {formError}
        </p>
      )}

      <Button type="submit" full disabled={isSubmitting} className="mt-[22px]">
        {isSubmitting ? "Menyimpan..." : "Simpan password baru"}
      </Button>
    </form>
  );
}