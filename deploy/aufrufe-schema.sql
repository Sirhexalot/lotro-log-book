-- Monthly page views per entity. Apply once by hand to the `llb` database
-- (same account and file as the feedback form: phptmp/llb-feedback.env).
-- The code never runs DDL; without this table the counter stays silent.
--
-- One row per (month, kind, id). The same entity has one row in three
-- languages, so the count is language-independent. Only the aggregate is
-- stored: no address, no cookie, no individual visit, no history.
CREATE TABLE IF NOT EXISTS llb_aufrufe (
    monat   CHAR(7)     NOT NULL,   -- '2026-11'
    art     VARCHAR(16) NOT NULL,   -- 'q','d','i','recipe','set','giver',…
    kennung VARCHAR(32) NOT NULL,   -- the stable entity id
    zahl    INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (monat, art, kennung),
    KEY idx_monat_zahl (monat, zahl)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
