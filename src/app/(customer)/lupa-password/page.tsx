import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Lupa Password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-[70vh] bg-[#ffffff] pb-[60px]">
      <PageHero
        compact
        eyebrow="Akun GAICREAM"
        title="Lupa password"
        description="Tenang, kita buat password baru lewat email."
      />
      <AuthCard>
        <ForgotPasswordForm
          initialError={
            params.error === "kedaluwarsa"
              ? "Tautan sudah tidak berlaku. Minta tautan baru di bawah ini."
              : undefined
          }
        />
      </AuthCard>
    </main>
  );
}
