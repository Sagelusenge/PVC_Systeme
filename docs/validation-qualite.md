# Validation qualite du systeme PVC

Date du controle : 2 octobre 2026

## Perimetre

Cette validation couvre les deux objectifs suivants :

1. controler les acces et les parcours de chaque role ;
2. ajouter une couverture de tests durable au frontend et au backend.

Les controles d'integration executes sur le site publie sont en lecture seule. Ils ne creent, ne modifient et ne suppriment aucune donnee de production.

## Resultats par role

Les 11 comptes fonctionnels ont ete authentifies avec succes :

- Administrateur ;
- Direction ;
- Comptable ;
- Caissier ;
- RH ;
- Commercial ;
- Magasinier ;
- Agent d'achat ;
- Responsable production ;
- Responsable immobilisations ;
- Auditeur.

Pour chaque compte, le test verifie le profil retourne, le tableau de bord et tous les modules autorises par la matrice de droits.

## Resultats des parcours

- 100 clients controles ;
- 100 commandes controlees ;
- 100 ventes controlees ;
- 100 paiements controles ;
- 100 produits finis controles ;
- 100 matieres premieres controlees ;
- 100 agents controles ;
- 100 paies controlees ;
- 100 immobilisations controlees ;
- 398 lignes comptables controlees ;
- commande `CMD-2026-0090` et vente `104` coherentes sur le client, les produits, les quantites, les prix et le total ;
- paiement reel rattache a la bonne vente et au bon client, sans depassement du total facture ;
- 199 documents comptables equilibres entre debit et credit ;
- 8 etats de sortie accessibles et retournant un format valide.

## Tests automatises

Le frontend contient une matrice centrale des droits, utilisee par les routes et le menu. Les tests couvrent les 11 roles, les modules autorises, les refus et les roles inconnus.

Le backend teste :

- les droits d'ecriture sur 10 familles de routes ;
- la generation automatique des codes ;
- la creation des paires comptables SYSCOHADA ;
- le paiement et son annulation ;
- les mots de passe et la pagination.

## Commandes

```powershell
cd frontend
npm test
npm run build

cd ..\backend
npm test
$env:QA_API_URL='https://pvc-systeme-api.onrender.com/api'
npm run qa:production
```
