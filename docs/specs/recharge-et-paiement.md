# TutinGo — Page « Recharge » et méthodes de paiement

> Spécification fonctionnelle et technique
> Modes de paiement : **Cash**, **Payzone** (carte bancaire, Maroc), **PayPal**

---

## 1. Objectif

Permettre aux parents / élèves de **recharger leur solde TutinGo** (porte-monnaie interne) afin de payer les cours avec les professeurs, en choisissant librement leur mode de paiement :

| Mode | Public visé | Confirmation | Délai de crédit du solde |
|------|-------------|--------------|--------------------------|
| **Cash** | Clients sans carte bancaire | Manuelle (agent / admin) | Après validation (quelques heures à 48 h) |
| **Payzone** | Cartes bancaires marocaines (CMI, Visa, Mastercard) en MAD | Automatique (callback) | Immédiat |
| **PayPal** | Clients à l'étranger / diaspora, cartes internationales | Automatique (webhook) | Immédiat |

Le solde est toujours exprimé en **dirhams (MAD)**. Les paiements dans une autre devise (PayPal) sont convertis au taux affiché avant paiement.

---

## 2. Parcours utilisateur

### 2.1 Accès
- Menu du compte : **Mon portefeuille → Recharger**
- Bouton « Recharger » visible sur le tableau de bord, et proposé automatiquement si le solde est insuffisant au moment de réserver un cours (avec retour vers la réservation après recharge).
- URL : `/compte/recharge`

### 2.2 Étapes

1. **Choix du montant**
   - Packs prédéfinis (cartes cliquables), ex. : 200 MAD · 500 MAD · 1 000 MAD · 2 000 MAD
   - Option « Autre montant » (champ libre)
   - Bornes : minimum **100 MAD**, maximum **10 000 MAD** par transaction (paramétrable en admin)
   - Bonus optionnel affiché sur les packs (ex. « +5 % offerts dès 1 000 MAD ») — paramétrable
   - Équivalent en heures de cours affiché à titre indicatif (« ≈ 4 h de cours »)

2. **Choix du mode de paiement** (3 cartes radio avec logo)
   - 💵 **Cash** — « Payez en espèces dans un point de paiement ou auprès de notre agence »
   - 💳 **Carte bancaire (Payzone)** — logos CMI / Visa / Mastercard
   - 🅿️ **PayPal** — « Montant débité en EUR : xx,xx € (taux 1 € = x,xx MAD) »
   - Les modes désactivés en admin ne s'affichent pas.

3. **Récapitulatif**
   - Montant, bonus éventuel, frais éventuels (par mode, paramétrables), total à payer, montant crédité au solde
   - Case à cocher obligatoire : « J'accepte les conditions générales de vente et la politique de remboursement »
   - Bouton **« Payer xxx MAD »**

4. **Paiement** (selon le mode, voir §3)

5. **Résultat**
   - Page succès : nouveau solde, n° de transaction, lien vers le reçu PDF, bouton « Réserver un cours »
   - Page échec / annulation : message clair + bouton « Réessayer » ou « Choisir un autre mode »
   - Page « En attente » (Cash) : instructions + référence de paiement

### 2.3 Historique
Sous la page, ou dans `/compte/portefeuille/historique` : tableau des transactions
(date, référence, mode, montant, statut, reçu). Filtres par statut et par période.

---

## 3. Détail par mode de paiement

### 3.1 Cash (espèces)

**Fonctionnement**
1. L'utilisateur valide → création d'une transaction au statut `pending`.
2. Génération d'une **référence unique** (ex. `TG-CASH-7F3K92`) valable **72 h**.
3. Affichage + envoi par e-mail / SMS / WhatsApp des instructions :
   - montant exact à payer,
   - référence à communiquer,
   - lieux acceptés (agence TutinGo, agent commercial, ou réseau de transfert type Wafacash / Cash Plus selon les accords en place),
   - date limite.
4. À la réception de l'argent, un **agent ou admin** recherche la référence dans le back-office et clique **« Confirmer la réception »** (saisie du montant reçu + justificatif photo optionnel).
5. Le solde est crédité, statut `paid`, notification envoyée au client.
6. Sans paiement avant l'échéance → statut `expired` (tâche planifiée).

**Règles**
- Nombre maximum de demandes cash en attente par utilisateur : 2.
- Seuls les rôles `admin` et `agent_caisse` peuvent confirmer.
- Toute confirmation est journalisée (qui, quand, montant reçu).
- Si montant reçu ≠ montant demandé : l'agent crédite le montant réellement reçu, avec commentaire obligatoire.

### 3.2 Payzone (carte bancaire, MAD)

**Fonctionnement** (page de paiement hébergée par Payzone — aucune donnée de carte ne transite par TutinGo, ce qui évite la conformité PCI-DSS complète)
1. Création de la transaction `pending` avec un `order_id` unique.
2. Construction de la requête de paiement (montant en centimes MAD, devise 504, `order_id`, e-mail client, URL de retour succès / échec, URL de notification), **signée** avec la clé secrète marchand selon la documentation Payzone fournie au marchand.
3. Redirection de l'utilisateur vers la page de paiement Payzone (3-D Secure géré par Payzone).
4. Payzone appelle l'**URL de notification serveur-à-serveur** (callback) :
   - vérification de la signature,
   - vérification que montant et devise correspondent à la transaction,
   - idempotence : si la transaction est déjà `paid`, ne rien recréditer,
   - mise à jour du statut `paid` / `failed` et crédit du solde.
5. L'utilisateur revient sur l'URL de retour → affichage du statut **lu en base** (ne jamais créditer sur la base de l'URL de retour seule, qui est falsifiable).

**Configuration (`.env`)**
```
PAYZONE_MERCHANT_ID=
PAYZONE_SECRET_KEY=
PAYZONE_NOTIFICATION_KEY=
PAYZONE_BASE_URL=        # sandbox ou production
PAYZONE_ENABLED=true
```

### 3.3 PayPal

**Fonctionnement** (PayPal Checkout — API Orders v2 + boutons JS PayPal)
1. PayPal ne gère pas le dirham : conversion **MAD → EUR** (ou USD) avec un taux paramétrable en admin (ou récupéré quotidiennement), majoré d'une marge éventuelle pour couvrir les frais PayPal. Le montant EUR et le taux sont **figés dans la transaction**.
2. Le front appelle `POST /api/paiements/paypal/create-order` → le serveur crée l'ordre PayPal (`intent=CAPTURE`, `custom_id` = id de transaction TutinGo) et renvoie l'`orderID`.
3. L'utilisateur approuve dans la fenêtre PayPal.
4. Le front appelle `POST /api/paiements/paypal/capture-order` → le serveur capture l'ordre, vérifie montant/devise/`custom_id`, puis crédite le solde **en MAD** (montant demandé initialement).
5. **Webhook** PayPal (`PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`) avec vérification de signature via l'API `verify-webhook-signature` : filet de sécurité si l'utilisateur ferme la fenêtre avant l'étape 4, et gestion des remboursements / litiges.

**Configuration (`.env`)**
```
PAYPAL_MODE=sandbox      # ou live
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_CURRENCY=EUR
PAYPAL_ENABLED=true
```

---

## 4. Modèle de données (Laravel)

### `wallets`
| Champ | Type | Note |
|-------|------|------|
| id | bigint | |
| user_id | FK users, unique | |
| balance | decimal(12,2) | en MAD, jamais négatif |
| timestamps | | |

### `payment_transactions`
| Champ | Type | Note |
|-------|------|------|
| id | bigint | |
| reference | string unique | ex. `TG-20261023-AB12CD` |
| user_id | FK | |
| method | enum `cash`, `payzone`, `paypal` | |
| status | enum `pending`, `paid`, `failed`, `cancelled`, `expired`, `refunded` | |
| amount | decimal(12,2) | montant demandé en MAD |
| bonus_amount | decimal(12,2) | |
| fee_amount | decimal(12,2) | |
| credited_amount | decimal(12,2) nullable | réellement crédité |
| provider_currency | string(3) | MAD / EUR / USD |
| provider_amount | decimal(12,2) | montant facturé par le prestataire |
| exchange_rate | decimal(10,4) nullable | PayPal |
| provider_reference | string nullable | id Payzone / id ordre et capture PayPal |
| provider_payload | json nullable | dernière réponse brute (sans données sensibles) |
| expires_at | datetime nullable | cash |
| confirmed_by | FK users nullable | cash |
| paid_at | datetime nullable | |
| timestamps | | |

### `wallet_movements` (grand livre — source de vérité du solde)
| Champ | Type | Note |
|-------|------|------|
| id | bigint | |
| wallet_id | FK | |
| type | enum `credit`, `debit` | |
| reason | enum `topup`, `bonus`, `lesson_payment`, `refund`, `adjustment` | |
| amount | decimal(12,2) | |
| balance_after | decimal(12,2) | |
| payment_transaction_id | FK nullable | |
| description | string | |
| created_at | | |

Le crédit du solde se fait **dans une transaction SQL** avec `lockForUpdate()` sur le wallet, et écrit toujours un `wallet_movement`.

---

## 5. Architecture technique

```
app/
├── Enums/PaymentMethod.php, PaymentStatus.php
├── Models/Wallet.php, PaymentTransaction.php, WalletMovement.php
├── Services/Payments/
│   ├── PaymentGatewayInterface.php   // initiate(), handleCallback(), refund()
│   ├── CashGateway.php
│   ├── PayzoneGateway.php
│   ├── PaypalGateway.php
│   └── PaymentManager.php            // résout le gateway selon le mode
├── Services/WalletService.php        // credit(), debit() atomiques
├── Http/Controllers/
│   ├── TopupController.php           // page, création de la recharge
│   ├── Webhooks/PayzoneWebhookController.php
│   ├── Webhooks/PaypalWebhookController.php
│   └── Admin/CashPaymentController.php
├── Jobs/ExpirePendingCashPayments.php   // planifié toutes les heures
└── Notifications/TopupSucceeded.php, CashPaymentInstructions.php
```

### Routes
```
GET   /compte/recharge                       TopupController@index
POST  /compte/recharge                       TopupController@store
GET   /compte/recharge/{reference}           TopupController@show     (succès / attente / échec)
GET   /compte/recharge/{reference}/recu      TopupController@receipt  (PDF)

POST  /api/paiements/paypal/create-order
POST  /api/paiements/paypal/capture-order

POST  /webhooks/payzone      (exclu du CSRF, signature obligatoire)
POST  /webhooks/paypal       (exclu du CSRF, signature obligatoire)

GET   /admin/paiements                       liste + filtres + export CSV
POST  /admin/paiements/{id}/confirmer-cash
POST  /admin/paiements/{id}/rembourser
```

---

## 6. Back-office (admin)

- **Liste des transactions** : filtres par mode, statut, date, utilisateur ; totaux ; export CSV / Excel.
- **Paiements cash en attente** : recherche par référence, bouton « Confirmer la réception ».
- **Paramètres** :
  - activer / désactiver chaque mode,
  - montants min / max, packs proposés, bonus,
  - frais par mode (fixe et/ou %),
  - taux de change MAD → EUR pour PayPal + marge,
  - durée de validité d'une référence cash.
- **Remboursements** : automatique via API pour Payzone / PayPal, manuel pour le cash ; débit du solde correspondant.
- **Ajustement manuel du solde** (avec motif obligatoire, journalisé).

---

## 7. Sécurité et fiabilité

- Montant **toujours recalculé côté serveur** ; ne jamais faire confiance au montant envoyé par le navigateur.
- Vérification de **signature** sur tous les callbacks / webhooks ; rejet (HTTP 400) sinon.
- **Idempotence** : un même paiement prestataire ne peut créditer qu'une seule fois (contrainte unique sur `provider_reference` + vérification du statut).
- Clés et secrets uniquement dans `.env`, jamais dans le dépôt.
- HTTPS obligatoire ; `rate limiting` sur la création de recharge (ex. 10 / heure / utilisateur).
- Journalisation des callbacks (canal de log dédié `payments`), sans données de carte.
- Alertes admin en cas d'écart montant attendu / montant reçu.

---

## 8. Notifications

| Événement | Canal |
|-----------|-------|
| Recharge réussie (Payzone / PayPal / cash confirmé) | E-mail + notification in-app (+ SMS/WhatsApp optionnel) |
| Instructions cash + référence | E-mail + SMS / WhatsApp |
| Rappel cash 24 h avant expiration | E-mail / SMS |
| Paiement échoué | In-app |
| Remboursement | E-mail |

Chaque recharge réussie génère un **reçu PDF** (référence, date, mode, montant, bonus, solde après opération).

---

## 9. Interface (maquette textuelle)

```
┌──────────────────────────────────────────────────────┐
│  Recharger mon solde            Solde actuel : 150 MAD│
├──────────────────────────────────────────────────────┤
│ 1. Montant                                            │
│ [ 200 MAD ] [ 500 MAD ] [ 1000 MAD +5% ] [ 2000 MAD ] │
│ ( ) Autre montant : [______] MAD                      │
│                                                       │
│ 2. Mode de paiement                                   │
│ (•) 💳 Carte bancaire — Payzone   CMI · Visa · MC     │
│ ( ) 🅿️ PayPal — 47,30 € débités                        │
│ ( ) 💵 Espèces — crédit après validation              │
│                                                       │
│ 3. Récapitulatif                                      │
│   Montant             500,00 MAD                      │
│   Frais                 0,00 MAD                      │
│   Crédité au solde    500,00 MAD                      │
│ [x] J'accepte les CGV                                 │
│                                [ Payer 500 MAD ]      │
└──────────────────────────────────────────────────────┘
```

- Responsive mobile en priorité (une colonne, bouton fixe en bas).
- Interface en français et en arabe (RTL), anglais optionnel.
- Bouton désactivé + indicateur de chargement pendant le traitement pour éviter les doubles clics.

---

## 10. Critères d'acceptation

- [ ] Un utilisateur connecté peut choisir un pack ou un montant libre dans les bornes autorisées.
- [ ] Les trois modes s'affichent selon leur activation en admin.
- [ ] Paiement Payzone réussi en sandbox → solde crédité via callback, une seule fois même si le callback est rejoué.
- [ ] Paiement PayPal réussi en sandbox → solde crédité en MAD ; montant EUR et taux enregistrés.
- [ ] Fermeture de la fenêtre PayPal après approbation → solde crédité via webhook.
- [ ] Demande cash → référence générée, instructions envoyées, statut `pending`.
- [ ] Confirmation cash par un agent → solde crédité, action journalisée.
- [ ] Référence cash non payée → `expired` après le délai configuré.
- [ ] Callback avec signature invalide → rejeté, aucun crédit.
- [ ] Historique des transactions et reçu PDF disponibles côté client.
- [ ] Tests automatisés (Feature tests) couvrant chaque gateway avec appels HTTP simulés (`Http::fake()`).

---

## 11. Découpage proposé

1. Modèle de données, `WalletService`, historique (base commune).
2. Page de recharge + mode **Cash** + back-office de confirmation.
3. Intégration **Payzone** (sandbox puis production).
4. Intégration **PayPal** (sandbox puis production).
5. Reçus PDF, notifications, paramètres admin, remboursements.
