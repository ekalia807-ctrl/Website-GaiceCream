"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type Row = Record<string, unknown>;

function fromRow(row: Row): AppNotification {
  return {
    id: String(row.id),
    type: String(row.type ?? ""),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    link: row.link ? String(row.link) : null,
    read: Boolean(row.read),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

const MAX_ITEMS = 30;
/** cadangan jika koneksi realtime putus: cek notifikasi baru tiap 20 detik saat tab terbuka */
const POLL_MS = 20_000;

/**
 * Notifikasi milik satu pengguna: daftar terbaru + pembaruan langsung (Supabase Realtime).
 * Jika koneksi realtime bermasalah (mis. sinyal HP naik-turun), notifikasi tetap masuk lewat
 * pengecekan berkala dan saat tab kembali dibuka. Jika tabel notifications belum dibuat
 * (migrasi belum dijalankan), hook ini diam saja dan website tetap berjalan normal.
 */
export function useNotifications(
  userId: string | null,
  onNew?: (notification: AppNotification) => void,
) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const onNewRef = useRef(onNew);
  useEffect(() => {
    onNewRef.current = onNew;
  }, [onNew]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    let active = true;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    // id yang sudah dikenal: mencegah notifikasi yang sama muncul dua kali (realtime + cek berkala)
    const known = new Set<string>();
    let initialLoaded = false;

    function receive(created: AppNotification) {
      if (known.has(created.id)) return;
      known.add(created.id);
      setItems((previous) =>
        previous.some((item) => item.id === created.id)
          ? previous
          : [created, ...previous].slice(0, MAX_ITEMS),
      );
      // notifikasi lama yang baru dimuat tidak memunculkan toast; hanya yang benar-benar baru
      if (initialLoaded) onNewRef.current?.(created);
    }

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!active || !data) return;
      const rows = (data as Row[]).map(fromRow);
      if (!initialLoaded) {
        rows.forEach((row) => known.add(row.id));
        setItems(rows);
        initialLoaded = true;
        return;
      }
      // dari yang terlama ke terbaru agar urutan toast benar
      [...rows].reverse().forEach(receive);
    }

    void load();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => receive(fromRow(payload.new as Row)),
      )
      .subscribe((status) => {
        // setelah tersambung (atau tersambung ulang), ambil yang mungkin terlewat
        if (status === "SUBSCRIBED" && initialLoaded) void load();
      });

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      active = false;
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const markRead = useCallback((id: string) => {
    setItems((previous) => previous.map((item) => (item.id === id ? { ...item, read: true } : item)));
    void createClient().from("notifications").update({ read: true }).eq("id", id);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((previous) => previous.map((item) => ({ ...item, read: true })));
    if (userId) {
      void createClient()
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
    }
  }, [userId]);

  const unread = items.filter((item) => !item.read).length;
  return { items, unread, markRead, markAllRead };
}
