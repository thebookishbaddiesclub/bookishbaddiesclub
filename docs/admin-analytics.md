# Statistiques dans l’administration

L’encart lit les totaux de production Vercel Web Analytics depuis l’activation du suivi. Il affiche visiteurs et pages vues, avec un cache serveur de cinq minutes. Il ne prétend pas présenter les 30 derniers jours.

Dans Vercel > projet > Settings > Environment Variables, pour Production :
- `VERCEL_ANALYTICS_TOKEN` : token créé dans https://vercel.com/account/tokens, avec accès à l’équipe du projet. Ne jamais le préfixer par NEXT_PUBLIC ni le partager dans un message.
- `VERCEL_PROJECT_ID` : identifiant du projet dans Settings > General, si les variables système Vercel ne sont pas exposées automatiquement.
- `VERCEL_TEAM_ID` : facultatif ; à défaut, la requête utilise le slug de l’équipe actuelle `thebookishbaddiesclub-6479s-projects`.

Redéployer après ajout. Ouvrir l’admin puis Actualiser. Une configuration absente ou une erreur ne sont jamais affichées comme zéro visite.

Référence : https://vercel.com/docs/analytics/web-analytics-api
