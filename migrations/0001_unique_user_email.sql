-- One active account per email address (case-insensitive).
-- Deleted accounts (status 3) are excluded so the address can be reused.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_unique
    ON users (lower(email_address))
    WHERE status < 3;
