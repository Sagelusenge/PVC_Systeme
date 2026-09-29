-- Corrige le sens des paires automatiques créées avant la mise en conformité SYSCOHADA.
-- CP représente le débit et C représente le crédit dans les vues comptables existantes.
UPDATE tecritures_comptables
SET source_type = CONCAT(source_type, '_FIX')
WHERE source_type IN ('VENTE', 'REGLEMENT', 'REGLEMENT_ANNULE');

UPDATE tecritures_comptables
SET source_id = source_id + 1000000000
WHERE source_type LIKE '%_FIX' AND sens = 'C';

UPDATE tecritures_comptables
SET sens = 'C'
WHERE source_type LIKE '%_FIX' AND sens = 'CP';

UPDATE tecritures_comptables
SET sens = 'CP', source_id = source_id - 1000000000
WHERE source_type LIKE '%_FIX' AND source_id >= 1000000000;

UPDATE tecritures_comptables
SET source_type = LEFT(source_type, CHAR_LENGTH(source_type) - 4)
WHERE source_type LIKE '%_FIX';
