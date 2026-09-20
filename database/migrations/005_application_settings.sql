CREATE TABLE IF NOT EXISTS tparametres_application (
  cle VARCHAR(80) NOT NULL,
  valeur VARCHAR(255) NOT NULL,
  description VARCHAR(255) NULL,
  date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tparametres_application (cle, valeur, description)
VALUES ('taux_usd_fc', '2850', 'Taux de conversion de reference USD vers FC')
ON DUPLICATE KEY UPDATE description = VALUES(description);
