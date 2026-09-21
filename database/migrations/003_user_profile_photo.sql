SET @photo_url_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tutilisateurs'
    AND column_name = 'photo_url'
);

SET @photo_url_sql = IF(
  @photo_url_exists = 0,
  'ALTER TABLE tutilisateurs ADD COLUMN photo_url LONGTEXT NULL AFTER email',
  'SELECT 1'
);

PREPARE photo_url_statement FROM @photo_url_sql;
EXECUTE photo_url_statement;
DEALLOCATE PREPARE photo_url_statement;
