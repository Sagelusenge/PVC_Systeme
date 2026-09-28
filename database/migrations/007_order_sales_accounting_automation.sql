CREATE TABLE IF NOT EXISTS tschema_migrations (
  nom_fichier VARCHAR(150) NOT NULL,
  date_execution TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (nom_fichier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @vente_id_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'tcommandeclient' AND column_name = 'vente_id'
);
SET @vente_id_sql = IF(
  @vente_id_exists = 0,
  'ALTER TABLE tcommandeclient ADD COLUMN vente_id INT NULL AFTER date_paiement_anticipation, ADD INDEX idx_commande_vente (vente_id), ADD CONSTRAINT fk_commande_vente FOREIGN KEY (vente_id) REFERENCES tventeproduitfini(id)',
  'SELECT 1'
);
PREPARE vente_id_statement FROM @vente_id_sql;
EXECUTE vente_id_statement;
DEALLOCATE PREPARE vente_id_statement;

SET @source_type_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'tecritures_comptables' AND column_name = 'source_type'
);
SET @source_type_sql = IF(
  @source_type_exists = 0,
  'ALTER TABLE tecritures_comptables ADD COLUMN source_type VARCHAR(30) NULL AFTER id_user, ADD COLUMN source_id INT NULL AFTER source_type, ADD UNIQUE INDEX uq_ecriture_source (source_type, source_id, sens)',
  'SELECT 1'
);
PREPARE source_type_statement FROM @source_type_sql;
EXECUTE source_type_statement;
DEALLOCATE PREPARE source_type_statement;

INSERT INTO tcomptes (numero, intitule, masse_bilantaire, id_naturecompte)
SELECT '52', 'BANQUES', NULL, id_nature FROM tnature_compte WHERE nature_compte='ACTIF'
  AND NOT EXISTS (SELECT 1 FROM tcomptes WHERE numero='52') LIMIT 1;
INSERT INTO tcomptes (numero, intitule, masse_bilantaire, id_naturecompte)
SELECT '57', 'CAISSE', NULL, id_nature FROM tnature_compte WHERE nature_compte='ACTIF'
  AND NOT EXISTS (SELECT 1 FROM tcomptes WHERE numero='57') LIMIT 1;
INSERT INTO tcomptes (numero, intitule, masse_bilantaire, id_naturecompte)
SELECT '70', 'VENTES', NULL, id_nature FROM tnature_compte WHERE nature_compte='PRODUITS'
  AND NOT EXISTS (SELECT 1 FROM tcomptes WHERE numero='70') LIMIT 1;

INSERT INTO tsous_comptes (numero, intitule, compte_id)
SELECT '521100', 'Banque principale', id FROM tcomptes WHERE numero='52'
  AND NOT EXISTS (SELECT 1 FROM tsous_comptes WHERE numero='521100') LIMIT 1;
INSERT INTO tsous_comptes (numero, intitule, compte_id)
SELECT '571100', 'Caisse principale', id FROM tcomptes WHERE numero='57'
  AND NOT EXISTS (SELECT 1 FROM tsous_comptes WHERE numero='571100') LIMIT 1;
INSERT INTO tsous_comptes (numero, intitule, compte_id)
SELECT '701100', 'Ventes de produits finis PVC', id FROM tcomptes WHERE numero='70'
  AND NOT EXISTS (SELECT 1 FROM tsous_comptes WHERE numero='701100') LIMIT 1;
