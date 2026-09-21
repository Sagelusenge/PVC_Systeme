SET @role_status_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'troles' AND column_name = 'statut'
);
SET @role_status_sql = IF(
  @role_status_exists = 0,
  'ALTER TABLE troles ADD COLUMN statut ENUM(''Actif'',''Inactif'') NOT NULL DEFAULT ''Actif'' AFTER description',
  'SELECT 1'
);
PREPARE role_status_statement FROM @role_status_sql;
EXECUTE role_status_statement;
DEALLOCATE PREPARE role_status_statement;

CREATE TABLE IF NOT EXISTS tpaies_salaires (
  id INT NOT NULL AUTO_INCREMENT,
  id_agent INT NOT NULL,
  periode DATE NOT NULL,
  date_paiement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  montant_base DECIMAL(12,2) NOT NULL DEFAULT 0,
  avantages DECIMAL(12,2) NOT NULL DEFAULT 0,
  retenues DECIMAL(12,2) NOT NULL DEFAULT 0,
  montant_net DECIMAL(12,2) NOT NULL DEFAULT 0,
  montant_paye DECIMAL(12,2) NOT NULL DEFAULT 0,
  devise ENUM('USD','CDF') NOT NULL DEFAULT 'USD',
  mode_paiement ENUM('Especes','Banque','Mobile Money') NOT NULL DEFAULT 'Banque',
  reference_paiement VARCHAR(100) NULL,
  statut ENUM('Paye','Partiel','Annule') NOT NULL DEFAULT 'Paye',
  PRIMARY KEY (id),
  UNIQUE KEY uq_paie_agent_periode (id_agent, periode),
  CONSTRAINT fk_paie_agent FOREIGN KEY (id_agent) REFERENCES tpersonnel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
