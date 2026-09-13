-- Logo aplikasi untuk kartu di beranda dan kepala halaman aplikasi (docs/09 §6.1).
-- drizzle-kit tidak menulis ON DELETE pada ADD COLUMN, jadi ditambahkan manual supaya logo
-- yang dihapus dari Media cukup mengosongkan kolom ini.
-- Hanya menambah kolom, jadi aman diterapkan di produksi sebelum kode yang membacanya tayang.
ALTER TABLE `apps` ADD `logo_media_id` text REFERENCES media(id) ON DELETE set null;
