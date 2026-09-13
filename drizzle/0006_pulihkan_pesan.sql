-- Memulihkan tabel `contact_messages` untuk formulir di halaman Kontak (docs/09 §5.4 dan §9.2).
-- Sengaja memakai IF NOT EXISTS:
-- - Di produksi tabelnya masih ada dan kosong karena 0003 belum pernah diterapkan, dan versi
--   revisinya tidak lagi menghapus tabel ini. Migrasi ini tidak mengubah apa pun di sana.
-- - Di D1 lokal 0003 versi lama sudah terlanjur menghapusnya, jadi tabel dibuat ulang.
-- Definisinya sama persis dengan `0000_calm_bastion`.
CREATE TABLE IF NOT EXISTS `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_contact_status` ON `contact_messages` (`status`);
