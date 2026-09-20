INSERT INTO troles (nom_role, description) VALUES
  ('Direction', 'Consultation globale et validation'),
  ('Commercial', 'Gestion des clients, commandes et ventes'),
  ('Magasinier', 'Gestion du stock et des mouvements'),
  ('Agent d''achat', 'Gestion des achats de matieres'),
  ('Responsable production', 'Gestion des produits finis et de la production'),
  ('Responsable immobilisations', 'Gestion des materiels et amortissements'),
  ('Auditeur', 'Consultation en lecture seule')
ON DUPLICATE KEY UPDATE description = VALUES(description);

CREATE TABLE IF NOT EXISTS taudit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  utilisateur_id INT NULL,
  action VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  methode VARCHAR(10) NOT NULL,
  adresse_ip VARCHAR(64) NULL,
  date_action TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_audit_utilisateur (utilisateur_id),
  INDEX idx_audit_date (date_action),
  CONSTRAINT fk_audit_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES tutilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
