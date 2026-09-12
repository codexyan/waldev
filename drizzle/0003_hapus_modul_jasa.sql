-- Migrasi B (docs/09-arsip-aplikasi.md, bagian 9.2 langkah 5). TIDAK BISA DIBATALKAN.
-- Di produksi hanya boleh diterapkan setelah kode arsip aplikasi tayang dan terbukti jalan,
-- dengan persetujuan eksplisit pemilik saat itu, dan setelah 0002_salin_karya diterapkan.
--
-- 1) Bersihkan data yang tidak dipakai lagi (bagian 6.5 dan 13).
DELETE FROM articles WHERE slug IN ('membangun-web-cepat-cloudflare', 'prinsip-desain-produk-digital', 'otomasi-bisnis-dengan-workflow');--> statement-breakpoint
DELETE FROM seo_meta WHERE entity_type IN ('portfolio', 'service', 'client') OR (entity_type = 'article' AND entity_id NOT IN (SELECT id FROM articles));--> statement-breakpoint
DELETE FROM categories WHERE type <> 'article';--> statement-breakpoint
DELETE FROM settings WHERE key = 'contact_whatsapp';--> statement-breakpoint
DELETE FROM permissions WHERE key IN ('portfolio.create', 'portfolio.update', 'portfolio.delete', 'service.create', 'service.update', 'service.delete', 'testimonial.manage', 'client.manage', 'lead.read', 'lead.update');--> statement-breakpoint
DELETE FROM roles WHERE name = 'sales' AND NOT EXISTS (SELECT 1 FROM user WHERE user.role_id = roles.id);--> statement-breakpoint
-- 2) Hapus tabel modul jasa. Tabel anak dihapus sebelum induknya supaya aksi foreign key
--    tidak pernah berjalan terhadap tabel yang masih dirujuk.
DROP TABLE `collaboration_requests`;--> statement-breakpoint
DROP TABLE `contact_messages`;--> statement-breakpoint
DROP TABLE `testimonials`;--> statement-breakpoint
DROP TABLE `portfolio_features`;--> statement-breakpoint
DROP TABLE `portfolio_media`;--> statement-breakpoint
DROP TABLE `portfolio_technologies`;--> statement-breakpoint
DROP TABLE `portfolios`;--> statement-breakpoint
DROP TABLE `service_faqs`;--> statement-breakpoint
DROP TABLE `service_features`;--> statement-breakpoint
DROP TABLE `service_workflow_steps`;--> statement-breakpoint
DROP TABLE `services`;--> statement-breakpoint
DROP TABLE `clients`;
