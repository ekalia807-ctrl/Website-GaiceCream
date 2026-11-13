-- GAICREAM: notifikasi v2 (aman dijalankan berulang kali, juga jika 0002 belum/sudah dijalankan).
-- Cara: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.
--
-- Notifikasi otomatis dari database:
--   Admin     : pesanan baru masuk.
--   Pelanggan : pesanan diterima, status pesanan berubah (diproses, siap diambil, selesai, dibatalkan),
--               PO dibuka, PO ditutup.

-- ============================================================
-- Tabel + keamanan (Row Level Security)
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- daftar jenis notifikasi (ditambah 'po_closed')
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in ('order_new', 'order_status', 'po_open', 'po_closed'));

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id) where not read;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

-- pengguna hanya boleh mengubah kolom "read"; notifikasi dibuat oleh trigger di bawah
revoke update on public.notifications from authenticated, anon;
grant update (read) on public.notifications to authenticated;

-- ============================================================
-- Realtime: notifikasi baru langsung sampai ke browser tanpa refresh
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ============================================================
-- Trigger 1: pesanan baru -> semua admin
-- (create_order mengisi total di akhir proses, jadi trigger berjalan saat total terisi)
-- ============================================================
create or replace function public.notify_admins_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  select
    p.id,
    'order_new',
    'Pesanan baru masuk',
    '#' || new.order_number || ' · ' || new.customer_name || ' · Rp' ||
      replace(to_char(new.total, 'FM999,999,999,999'), ',', '.'),
    '/admin/pesanan'
  from public.profiles p
  where p.role = 'admin';
  return new;
end;
$$;

drop trigger if exists orders_notify_admins on public.orders;
create trigger orders_notify_admins
  after update of total on public.orders
  for each row
  when (old.total = 0 and new.total > 0)
  execute function public.notify_admins_new_order();

-- ============================================================
-- Trigger 2: pesanan baru -> pelanggan pemilik pesanan ("pesanan diterima")
-- ============================================================
create or replace function public.notify_customer_order_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.user_id,
    'order_status',
    'Pesananmu sudah kami terima',
    'Pesanan #' || new.order_number || ' menunggu konfirmasi.',
    '/riwayat'
  );
  return new;
end;
$$;

drop trigger if exists orders_notify_customer_received on public.orders;
create trigger orders_notify_customer_received
  after update of total on public.orders
  for each row
  when (old.total = 0 and new.total > 0)
  execute function public.notify_customer_order_received();

-- ============================================================
-- Trigger 3: status pesanan berubah -> pelanggan pemilik pesanan
-- ============================================================
create or replace function public.notify_customer_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if new.user_id is null then
    return new;
  end if;

  v_title := case new.status
    when 'diproses' then 'Pesananmu sedang diproses'
    when 'siap_diambil' then 'Pesananmu siap diambil'
    when 'selesai' then 'Pesananmu selesai'
    when 'dibatalkan' then 'Pesananmu dibatalkan'
    else null
  end;
  if v_title is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (new.user_id, 'order_status', v_title, 'Pesanan #' || new.order_number, '/riwayat');
  return new;
end;
$$;

drop trigger if exists orders_notify_customer on public.orders;
create trigger orders_notify_customer
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.notify_customer_order_status();

-- ============================================================
-- Trigger 4: PO dibuka -> semua pelanggan
-- ============================================================
create or replace function public.notify_customers_po_open()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  select
    p.id,
    'po_open',
    new.name || ' dibuka!',
    case
      when new.ready_date is not null
        then 'Ready ' || to_char(new.ready_date, 'DD-MM-YYYY') || '. Yuk pesan sekarang.'
      else 'Yuk pesan sekarang.'
    end,
    '/pesan'
  from public.profiles p
  where p.role = 'customer';
  return new;
end;
$$;

drop trigger if exists po_periods_notify_customers on public.po_periods;
create trigger po_periods_notify_customers
  after insert on public.po_periods
  for each row
  when (new.status = 'open')
  execute function public.notify_customers_po_open();

-- ============================================================
-- Trigger 5: PO ditutup -> semua pelanggan
-- Saat admin membuka PO baru, PO lama ikut ditutup otomatis; untuk kasus itu notifikasi
-- "ditutup" dilewati (open_po menandainya lewat pengaturan sementara di bawah).
-- ============================================================
create or replace function public.notify_customers_po_closed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('gaicream.opening_po', true), '') = '1' then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  select
    p.id,
    'po_closed',
    new.name || ' ditutup',
    'Terima kasih sudah memesan. Pantau Instagram untuk info PO berikutnya.',
    '/'
  from public.profiles p
  where p.role = 'customer';
  return new;
end;
$$;

drop trigger if exists po_periods_notify_closed on public.po_periods;
create trigger po_periods_notify_closed
  after update of status on public.po_periods
  for each row
  when (old.status = 'open' and new.status = 'closed')
  execute function public.notify_customers_po_closed();

-- open_po: sama seperti sebelumnya, ditambah penanda agar penutupan otomatis PO lama tidak memicu notifikasi "ditutup"
create or replace function public.open_po(
  p_name text,
  p_ready_date date,
  p_quota integer,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Tidak diizinkan.';
  end if;

  perform set_config('gaicream.opening_po', '1', true);

  update public.po_periods
  set status = 'closed', closed_at = now()
  where status = 'open';

  insert into public.po_periods (name, status, ready_date, quota, note)
  values (trim(p_name), 'open', p_ready_date, p_quota, coalesce(p_note, ''))
  returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.open_po(text, date, integer, text) from public, anon;
grant execute on function public.open_po(text, date, integer, text) to authenticated;

-- ============================================================
-- Pengecekan (opsional): jalankan terpisah setelah ada pesanan masuk
--   select type, title, body, created_at from public.notifications order by created_at desc limit 10;
--   select id, role from public.profiles where role = 'admin';   -- harus ada akun admin
-- ============================================================
