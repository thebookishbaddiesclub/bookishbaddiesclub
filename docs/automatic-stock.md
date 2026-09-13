# Stock automatique — préparation et validation

Branche locale : `fix/automatic-stock`.
Base inspectée : `61b62286bfb6aa081075200d5afcc3cd359def1c`.
Aucun envoi GitHub, aucune migration Supabase et aucun déploiement effectués.

## Changements préparés

- Le serveur relit les produits et prix dans Supabase et valide les quantités entières (1 à 999, doublons regroupés). Les produits doivent avoir un prix strictement positif.
- Une session Stripe est créée mais son URL n'est transmise qu'après réservation atomique de tous les produits. Une réservation échouée entraîne une tentative d'expiration de la session non communiquée.
- `products.stock` reste le stock physique non vendu. La disponibilité affichée soustrait les réservations actives, sans décompter une vente avant paiement.
- La session expire au bout d'environ 35 minutes. Une carte refusée, un abandon ou un retour à la boutique ne retirent rien au stock physique. La réservation reste active tant que Stripe permet encore de payer la session.
- Le webhook signé décrémente les quantités uniquement lorsque `payment_status` vaut `paid`. La mise à jour du stock et l'enregistrement du traitement sont une transaction PostgreSQL unique, identifiée par la session Stripe. Deux événements différents pour le même achat ne décrémentent pas deux fois.
- L'expiration confirmée par Stripe libère la réservation. Le passage de l'heure prévue ne suffit jamais : un paiement effectué peut encore attendre la livraison de son webhook.
- Une erreur en base retourne HTTP 500 au webhook afin que Stripe puisse réessayer.
- La boutique, la fenêtre Détails et le panier contrôlent la disponibilité. Elle est rafraîchie toutes les 30 secondes et au retour sur la fenêtre ; le serveur contrôle à nouveau au paiement.
- L'admin conserve le stock physique. Une sauvegarde basée sur un ancien stock est refusée ; un produit réservé ne peut pas être supprimé ou ramené sous la quantité réservée.
- Une commande manuelle de rapprochement récupère les réservations dont l'expiration est passée, vérifie leur état actuel auprès de Stripe et finalise les paiements ou libère les sessions réellement expirées.

## Vérifications locales

- `npm test` : 24 tests réussis, avec PostgreSQL embarqué PGlite et simulations des API HTTP. Les signatures des événements de test sont réellement vérifiées par le SDK Stripe.
- `npm run typecheck` : réussi, sans ignorer les erreurs TypeScript.
- `npm run build` : compilation réussie. Le projet existant désactive la vérification des types et ESLint pendant le build ; le contrôle TypeScript ci-dessus est donc indispensable.
- `npm run test:concurrency` : trois tests fournis utilisant plusieurs connexions PostgreSQL. Exécution bloquée ici par `shmget: Operation not permitted` au démarrage du serveur local. Ils doivent passer dans un environnement qui autorise PostgreSQL avant validation finale.
- Aucune transaction Stripe réelle ni opération sur une base distante n'a été réalisée.

Le fichier de verrouillage des dépendances a été resynchronisé : il ne correspondait pas aux versions déjà déclarées par le projet. Les outils de test sont des dépendances de développement. L'installation signale aussi des vulnérabilités dans l'arbre existant ; leur correction n'est pas incluse dans ce changement de stock.

## Préparer un environnement isolé

1. Utiliser Node.js 22 ou ultérieur et exécuter `npm ci`, puis les quatre commandes de validation ci-dessus.
2. Utiliser un projet Supabase de test avec le schéma réel du catalogue et quelques produits fictifs. Ne pas recopier les données clientes ou les secrets de production.
3. Inspecter le schéma et les règles d'accès avant la migration. Le dépôt initial ne contenait pas leurs définitions ; les tests locaux utilisent une table de produits représentative avec identifiants UUID.
4. Exécuter `supabase/migrations/202609130001_automatic_stock.sql` uniquement sur ce projet de test. La migration ajoute une contrainte de stock entier non nul et positif ou nul ; si des données existantes ne la respectent pas, elle échoue entièrement et ne les corrige pas silencieusement. Elle suppose une table `public.products` avec `id`, `price`, `stock`, `created_at`.
5. Les tables et fonctions de commandes sont réservées au rôle serveur `service_role`. Vérifier aussi les autorisations existantes de `products` : aucun accès direct anonyme ou authentifié ne doit permettre de modifier le stock. Cette migration ne remplace pas les politiques existantes du catalogue.
6. Configurer `.env.local` avec les valeurs de TEST dans le gestionnaire de secrets ou l'environnement local, jamais dans Git :

```text
NEXT_PUBLIC_SUPABASE_URL=<URL Supabase de test>
SUPABASE_SERVICE_ROLE_KEY=<clé serveur Supabase de test>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<clé publique Supabase de test>
STRIPE_SECRET_KEY=<clé Stripe sk_test_...>
STRIPE_WEBHOOK_SECRET=<secret whsec_... du webhook de test>
SITE_URL=http://localhost:3000
ADMIN_USERNAME=<identifiant de test>
ADMIN_PASSWORD=<mot de passe de test>
```

`SITE_URL` définit une origine de redirection de confiance, au lieu de prendre l'en-tête envoyé par le navigateur. La clé serveur Supabase est obligatoire pour le stock, sans repli sur une clé publique.

7. Démarrer le site avec `npm run dev`. Pour l'écoute locale Stripe :

```sh
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to localhost:3000/api/webhook
```

Utiliser le secret retourné par cette écoute. Pour un aperçu hébergé, renseigner son URL dans `SITE_URL`, et enregistrer son endpoint `/api/webhook` dans Stripe **en mode test**, avec les mêmes événements. Ne pas activer de moyens de paiement différés dans ce changement : le checkout conserve les cartes uniquement.

## Recette à faire avec Stripe test

- Stock 5, achat de 3 : pendant le checkout, stock physique 5 et disponibilité 2 ; après paiement, les deux valent 2.
- Rejouer le même événement et un événement de succès différent pour la même session : stock toujours 2.
- Refuser une carte puis abandonner : stock physique inchangé. Expirer réellement la session dans Stripe ; sa réservation doit être libérée.
- Stock 1, lancer deux achats simultanés : une seule session doit recevoir une URL utilisable via le site ; aucune survente.
- Stock 0 : impossible d'ajouter depuis une carte produit ou Détails, d'augmenter la quantité, ou de contourner le blocage en appelant directement le checkout.
- Modifier dans la requête le prix, la quantité ou un identifiant : prix serveur conservé, quantités invalides et produits absents refusés.
- Simuler une indisponibilité Supabase pendant le webhook : HTTP 500, puis réessai réussi sans double décompte.
- Garder l'admin ouvert pendant une vente, puis sauvegarder l'ancien stock : refus et invitation à recharger.
- Vérifier le rapprochement des événements manquants : `npm run stock:reconcile`. Cette commande lit `.env.local`, traite au plus 100 réservations échues et peut écrire dans la base désignée ; ne la lancer ici qu'avec l'environnement de test. Répéter pour un éventuel lot suivant. Aucune exécution planifiée n'est créée.

## Points à traiter avant une éventuelle production

- Valider la recette Stripe test, les tests de concurrence, le schéma et les politiques Supabase réels.
- Corriger séparément l'authentification admin déjà signalée : le code existant accepte un simple cookie `admin_session=true`. Ce changement n'inclut pas cette correction et ne rend pas cette authentification sûre.
- Les sessions Stripe créées avant cette version n'ont pas de correspondance produit fiable. Elles sont ignorées par le nouveau webhook et leurs stocks doivent être rapprochés manuellement. Prévoir leur expiration ou leur rapprochement lors d'une bascule validée.
- Définir la surveillance des webhooks en erreur et des réservations qui restent en attente. Le rapprochement manuel fourni permet de récupérer un événement perdu sans libération aveugle fondée sur l'heure.
- Les remboursements, retours, emails et stocks par taille/couleur restent hors périmètre. Les réservations portent sur le produit entier comme dans le catalogue actuel.
- La production et la branche principale nécessitent une validation explicite ultérieure.

## Retour arrière

Dans l'environnement de test, revenir au code précédent si nécessaire. Ne pas supprimer les réservations ni le journal des achats alors que des sessions peuvent encore être payées : d'abord les rapprocher avec Stripe et expirer celles encore ouvertes. Ne pas réinitialiser le stock physique ni rejouer des décomptes manuellement sans rapprocher les achats déjà marqués payés.
