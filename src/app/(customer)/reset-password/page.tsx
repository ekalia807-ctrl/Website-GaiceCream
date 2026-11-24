import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PageHero } from "@/components/ui/PageHero";
import { getSessionUser } from "@/lib/data/auth";

export const metadata: Metadata = { title: "Password Baru" };

export default async function ResetPasswordPage() {
  // halaman ini hanya bisa dibuka lewat tautan di email (yang membuat sesi sementara)
  const user = await getSessionUser();
  if (!user) redirect("/lupa-password?error=kedaluwarsa");

  return (
    <main className="min-h-[70vh] bg-[#ffffff] pb-[60px]">
      <PageHero
        compact
        eyebrow="Akun GAICREAM"
        title="Password baru"
        description="Buat password baru untuk akunmu."
      />
      <AuthCard>
        <ResetPasswordForm />
      </AuthCard>
    </main>
  );
}
