-- Regroupe et remet dans le bon sens les quatre lignes historiques du jeu initial.
UPDATE tecritures_comptables
SET sens = 'CP'
WHERE numdocument = 'ACH-26091';

UPDATE tecritures_comptables
SET numdocument = 'ACH-26091', sens = 'C'
WHERE numdocument = 'ACH-26092';

UPDATE tecritures_comptables
SET sens = 'CP'
WHERE numdocument = 'VTE-26041';

UPDATE tecritures_comptables
SET numdocument = 'VTE-26041', sens = 'C'
WHERE numdocument = 'VTE-26042';
