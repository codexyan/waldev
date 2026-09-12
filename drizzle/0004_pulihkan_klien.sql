-- Memulihkan tabel `clients` untuk logo klien di beranda (docs/09 §6.5 dan §9.2).
-- Sengaja memakai IF NOT EXISTS:
-- - Di produksi tabelnya masih ada karena 0003 versi revisi tidak lagi menghapusnya,
--   jadi migrasi ini tidak mengubah apa pun dan data klien tetap utuh.
-- - Di D1 lokal 0003 versi lama sudah terlanjur menghapusnya, jadi tabel dibuat ulang.
-- Definisinya sama persis dengan `0000_calm_bastion`.
CREATE TABLE IF NOT EXISTS `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo_media_id` text,
	`category_id` text,
	`website_url` text,
	`is_nda` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`logo_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `clients_slug_unique` ON `clients` (`slug`);
