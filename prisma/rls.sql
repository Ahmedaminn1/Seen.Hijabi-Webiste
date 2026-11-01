-- Row Level Security (RLS) Policies for Seen Hijabi
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fjafvxvwqhojskcchxuq/sql/new

-- Enable RLS on all tables
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_colors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_sizes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Storefront
CREATE POLICY "Allow public read on active categories" ON "categories"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read on active products" ON "products"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read on product images" ON "product_images"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on product colors" ON "product_colors"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on product sizes" ON "product_sizes"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on product variants" ON "product_variants"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on inventory quantity" ON "inventories"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on store settings" ON "store_settings"
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on shipping settings" ON "shipping_settings"
  FOR SELECT USING (true);

-- 2. Checkout / Order Creation (Public insert via server action/API)
CREATE POLICY "Allow public insert on orders" ON "orders"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on order items" ON "order_items"
  FOR INSERT WITH CHECK (true);

-- 3. Admin Full Access Policies (Service Role / Authenticated Admin)
-- When Prisma connects with Postgres credentials or Server Actions use service role key,
-- RLS is bypassed automatically.
-- For direct Supabase client queries authenticated as Admin:
CREATE POLICY "Admin full access on categories" ON "categories"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Admin full access on products" ON "products"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Admin full access on product images" ON "product_images"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Admin full access on orders" ON "orders"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Admin full access on store settings" ON "store_settings"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Admin full access on shipping settings" ON "shipping_settings"
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true));

