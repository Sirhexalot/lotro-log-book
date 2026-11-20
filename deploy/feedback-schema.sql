-- Apply once to the `llb` database using the account configured in
-- ~/llb-feedback.env. Feedback is retained until an administrator deletes it.
CREATE TABLE IF NOT EXISTS llb_feedback (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at_utc DATETIME NOT NULL,
    entity_type VARCHAR(60) NOT NULL DEFAULT '',
    entity_id VARCHAR(80) NOT NULL DEFAULT '',
    entity_name VARCHAR(180) NOT NULL DEFAULT '',
    page_url VARCHAR(2048) NOT NULL,
    message TEXT NOT NULL,
    reply_email VARCHAR(254) NOT NULL DEFAULT '',
    user_agent VARCHAR(512) NOT NULL DEFAULT '',
    viewport VARCHAR(40) NOT NULL DEFAULT '',
    email_notified TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_feedback_entity (entity_type, entity_id),
    KEY idx_feedback_created (created_at_utc),
    KEY idx_feedback_email_notified (email_notified, created_at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
