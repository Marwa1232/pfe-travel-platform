ALTER TABLE ai_data MODIFY COLUMN data LONGTEXT DEFAULT NULL CHECK (json_valid(`data`));
ALTER TABLE cancellation_policies MODIFY COLUMN rules_json LONGTEXT NOT NULL CHECK (json_valid(`rules_json`));
ALTER TABLE organizer_profiles MODIFY COLUMN documents LONGTEXT DEFAULT NULL CHECK (json_valid(`documents`));
ALTER TABLE users MODIFY COLUMN roles LONGTEXT NOT NULL CHECK (json_valid(`roles`));
ALTER TABLE users MODIFY COLUMN interests LONGTEXT DEFAULT NULL CHECK (json_valid(`interests`));
ALTER TABLE trips MODIFY COLUMN tags LONGTEXT DEFAULT NULL CHECK (json_valid(`tags`));
ALTER TABLE trips MODIFY COLUMN inclusions LONGTEXT DEFAULT NULL CHECK (json_valid(`inclusions`));
ALTER TABLE trips MODIFY COLUMN exclusions LONGTEXT DEFAULT NULL CHECK (json_valid(`exclusions`));
