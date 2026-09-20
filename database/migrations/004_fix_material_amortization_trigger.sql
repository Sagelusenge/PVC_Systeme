DROP TRIGGER IF EXISTS trigger1;

CREATE TRIGGER trigger1
AFTER INSERT ON tmateriels
FOR EACH ROW
INSERT INTO tplan_amortissements (
  id_materiel,
  date_calcul,
  valeur_base,
  taux,
  duree,
  mensualite,
  annuite,
  amort_cumule,
  valeur_nette
)
VALUES (
  NEW.id_materiel,
  CASE
    WHEN NEW.periodicite = 'Mensuel' THEN LAST_DAY(DATE_ADD(NEW.date_acquisition, INTERVAL 1 MONTH))
    ELSE STR_TO_DATE(CONCAT(YEAR(NEW.date_acquisition) + 1, '-12-31'), '%Y-%m-%d')
  END,
  NEW.valeur_acquisition,
  NEW.taux_amortissement,
  NEW.duree_utilisation,
  ROUND((NEW.valeur_acquisition - COALESCE(NEW.valeur_residuelle, 0)) / NULLIF(NEW.duree_utilisation * 12, 0), 2),
  ROUND((NEW.valeur_acquisition - COALESCE(NEW.valeur_residuelle, 0)) / NULLIF(NEW.duree_utilisation, 0), 2),
  ROUND((NEW.valeur_acquisition - COALESCE(NEW.valeur_residuelle, 0)) / NULLIF(NEW.duree_utilisation * 12, 0), 2),
  NEW.valeur_acquisition - ROUND((NEW.valeur_acquisition - COALESCE(NEW.valeur_residuelle, 0)) / NULLIF(NEW.duree_utilisation * 12, 0), 2)
);
