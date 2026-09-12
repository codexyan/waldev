-- Salin karya nyata (iaUndang, SIM-KGB) ke arsip aplikasi sebelum tabel karya dihapus.
-- docs/09-arsip-aplikasi.md, bagian 9.2 langkah 3 dan bagian 13.
--
-- id aplikasi = id karya lama, supaya fitur, teknologi, galeri, dan SEO bisa dipetakan langsung.
-- Status Rilis dan TERSEMBUNYI (keputusan pemilik 2026-09-12): status, tanggal rilis, dan
-- penjelasannya diperiksa dulu lewat panel sebelum ditayangkan. Tanggal rilis sengaja kosong
-- karena tanggal aslinya tidak pernah tercatat.
--
-- Teks tantangan dan solusi lama dipecah per paragraf (dipisah baris kosong) menjadi dokumen
-- Tiptap dan HTML dengan subjudul Tantangan dan Solusi. Semua INSERT memakai OR IGNORE supaya
-- aman dijalankan pada database yang tidak punya karya tersebut.
WITH bagian AS (
	SELECT
		id, title, slug, summary, demo_url, repo_url, cover_media_id, created_at,
		trim(CASE WHEN instr(challenge, char(10) || char(10)) > 0
			THEN substr(challenge, 1, instr(challenge, char(10) || char(10)) - 1)
			ELSE coalesce(challenge, '') END, ' ' || char(10) || char(13)) AS t1,
		trim(CASE WHEN instr(challenge, char(10) || char(10)) > 0
			THEN substr(challenge, instr(challenge, char(10) || char(10)) + 2)
			ELSE '' END, ' ' || char(10) || char(13)) AS t2,
		trim(CASE WHEN instr(solution, char(10) || char(10)) > 0
			THEN substr(solution, 1, instr(solution, char(10) || char(10)) - 1)
			ELSE coalesce(solution, '') END, ' ' || char(10) || char(13)) AS s1,
		trim(CASE WHEN instr(solution, char(10) || char(10)) > 0
			THEN substr(solution, instr(solution, char(10) || char(10)) + 2)
			ELSE '' END, ' ' || char(10) || char(13)) AS s2
	FROM portfolios
	WHERE slug IN ('iaundang', 'sim-kgb')
)
INSERT OR IGNORE INTO apps (
	id, name, slug, tagline, description_json, description_html, status, is_published,
	app_url, repo_url, cover_media_id, show_guide, show_faq, show_notes, show_releases,
	created_at, updated_at
)
SELECT
	id, title, slug, summary,
	json_object('type', 'doc', 'content', json_array(
		json('{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Tantangan"}]}'),
		json(CASE WHEN t1 = '' THEN '{"type":"paragraph"}' ELSE json_object('type', 'paragraph', 'content', json_array(json_object('type', 'text', 'text', t1))) END),
		json(CASE WHEN t2 = '' THEN '{"type":"paragraph"}' ELSE json_object('type', 'paragraph', 'content', json_array(json_object('type', 'text', 'text', t2))) END),
		json('{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Solusi"}]}'),
		json(CASE WHEN s1 = '' THEN '{"type":"paragraph"}' ELSE json_object('type', 'paragraph', 'content', json_array(json_object('type', 'text', 'text', s1))) END),
		json(CASE WHEN s2 = '' THEN '{"type":"paragraph"}' ELSE json_object('type', 'paragraph', 'content', json_array(json_object('type', 'text', 'text', s2))) END)
	)),
	'<h2>Tantangan</h2>'
		|| CASE WHEN t1 = '' THEN '' ELSE '<p>' || replace(replace(replace(t1, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</p>' END
		|| CASE WHEN t2 = '' THEN '' ELSE '<p>' || replace(replace(replace(t2, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</p>' END
		|| '<h2>Solusi</h2>'
		|| CASE WHEN s1 = '' THEN '' ELSE '<p>' || replace(replace(replace(s1, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</p>' END
		|| CASE WHEN s2 = '' THEN '' ELSE '<p>' || replace(replace(replace(s2, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</p>' END,
	'released', 0,
	demo_url, repo_url, cover_media_id, 0, 0, 1, 0,
	created_at, strftime('%s', 'now')
FROM bagian;
--> statement-breakpoint
INSERT OR IGNORE INTO app_features (id, app_id, title, description, "order")
SELECT f.id, f.portfolio_id, f.title, f.description, f."order"
FROM portfolio_features f
JOIN portfolios p ON p.id = f.portfolio_id
WHERE p.slug IN ('iaundang', 'sim-kgb');
--> statement-breakpoint
INSERT OR IGNORE INTO app_technologies (app_id, technology_id)
SELECT t.portfolio_id, t.technology_id
FROM portfolio_technologies t
JOIN portfolios p ON p.id = t.portfolio_id
WHERE p.slug IN ('iaundang', 'sim-kgb');
--> statement-breakpoint
INSERT OR IGNORE INTO app_media (id, app_id, media_id, caption, "order")
SELECT m.id, m.portfolio_id, m.media_id, m.caption, m."order"
FROM portfolio_media m
JOIN portfolios p ON p.id = m.portfolio_id
WHERE p.slug IN ('iaundang', 'sim-kgb');
--> statement-breakpoint
INSERT OR IGNORE INTO seo_meta (id, entity_type, entity_id, meta_title, meta_description, og_image_media_id, keywords, no_index)
SELECT lower(hex(randomblob(12))), 'app', s.entity_id, s.meta_title, s.meta_description, s.og_image_media_id, s.keywords, s.no_index
FROM seo_meta s
JOIN portfolios p ON p.id = s.entity_id
WHERE s.entity_type = 'portfolio' AND p.slug IN ('iaundang', 'sim-kgb');
