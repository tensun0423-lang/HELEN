-- =====================================================================
-- 報修登記系統：Supabase 建表 SQL
--
-- 用途：建立 public.repair_requests 資料表，並設定三層安全：
--   1. GRANT：資料表層級權限（anon 能碰哪些資料表、哪些欄位）
--   2. RLS  ：資料列安全（anon 能讀、能新增哪些資料列）
--   3. CHECK：資料表本身的限制（欄位值與文字長度）
--
-- 使用方式：在 Supabase 的 SQL Editor 貼上整份檔案後執行。
-- 這份檔案可以重複執行；已存在的資料表不會被刪除或清空。
-- 注意：如果資料表已經存在，CHECK 限制不會更新，要另外用 ALTER TABLE 修改。
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 建立資料表與 CHECK 限制（第 3 層）
-- ---------------------------------------------------------------------
-- 每個欄位都設成 not null，避免出現空白的報修紀錄。
-- 文字欄位先用 btrim 去掉前後空白再算長度，避免只填空白就送出。
-- 類別、緊急程度、處理狀態只能是指定的值，其他值一律拒絕。
-- 長度上限是暫定值，之後可依實際需求調整。
create table if not exists public.repair_requests (
  -- 主鍵：由資料庫自動產生 uuid，使用者不能自己指定
  id uuid primary key default gen_random_uuid(),

  -- 建立時間：由資料庫自動填入，使用者不能自己指定
  created_at timestamptz not null default now(),

  -- 報修人姓名：1～50 字
  reporter_name text not null
    constraint repair_requests_reporter_name_length
    check (char_length(btrim(reporter_name)) between 1 and 50),

  -- 地點或部門：1～100 字
  location text not null
    constraint repair_requests_location_length
    check (char_length(btrim(location)) between 1 and 100),

  -- 類別：只能是 設備／網路／環境／其他
  category text not null
    constraint repair_requests_category_values
    check (category in ('設備', '網路', '環境', '其他')),

  -- 問題說明：1～1000 字
  description text not null
    constraint repair_requests_description_length
    check (char_length(btrim(description)) between 1 and 1000),

  -- 緊急程度：只能是 低／中／高，沒填時預設「中」
  urgency text not null default '中'
    constraint repair_requests_urgency_values
    check (urgency in ('低', '中', '高')),

  -- 處理狀態：只能是 待處理／處理中／已完成，沒填時預設「待處理」
  status text not null default '待處理'
    constraint repair_requests_status_values
    check (status in ('待處理', '處理中', '已完成'))
);

comment on table public.repair_requests is '報修登記：同事送出的報修需求';

-- 清單依建立時間由新到舊排序，加索引讓查詢更快
create index if not exists repair_requests_created_at_idx
  on public.repair_requests (created_at desc);

-- ---------------------------------------------------------------------
-- 第 1 層：GRANT 權限
-- ---------------------------------------------------------------------
-- 這個專案不會自動開放新資料表給 API，所以要明確授權。
-- 先收回所有角色的權限，再只給 anon 需要的部分，避免殘留舊權限。
revoke all on table public.repair_requests from public, anon, authenticated;

-- 讓 anon 可以使用 public schema（Supabase 預設已有，寫出來比較清楚）
grant usage on schema public to anon;

-- 讀取：anon 可以讀整張表，用來顯示報修清單
grant select on table public.repair_requests to anon;

-- 新增：anon 只能填這 5 個欄位。
-- 刻意不開放 id、created_at、status：
--   id 和 created_at 由資料庫自動產生，不能偽造；
--   status 一律使用預設值「待處理」，前端送出時不要帶 status 欄位，
--   否則會出現 permission denied 錯誤。
grant insert (reporter_name, location, category, description, urgency)
  on table public.repair_requests to anon;

-- 不給 update、delete、truncate：anon 不能修改或刪除任何報修紀錄。
-- authenticated（登入使用者）目前沒有任何權限，之後做管理員登入時再另外授權。

-- ---------------------------------------------------------------------
-- 第 2 層：RLS 資料列安全
-- ---------------------------------------------------------------------
-- 啟用 RLS 後，沒有被 policy 允許的操作一律拒絕。
alter table public.repair_requests enable row level security;

-- 先刪除同名 policy，讓這份檔案可以重複執行
drop policy if exists "任何人可以讀取報修清單" on public.repair_requests;
drop policy if exists "任何人可以新增待處理的報修" on public.repair_requests;

-- 讀取：任何人（anon）都可以讀取全部報修紀錄
create policy "任何人可以讀取報修清單"
  on public.repair_requests
  for select
  to anon
  using (true);

-- 新增：任何人（anon）都可以新增，但新資料的 status 必須是「待處理」。
-- GRANT 已經不讓 anon 填 status，這裡再檢查一次，做為第二道防線。
create policy "任何人可以新增待處理的報修"
  on public.repair_requests
  for insert
  to anon
  with check (status = '待處理');

-- 沒有 update、delete 的 policy：即使權限設定出錯，RLS 也會擋下修改和刪除。

commit;
