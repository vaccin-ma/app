# jelba.ma – Vaccine reminders for parents

## Testing voice (voix) reminders

1. **Start the backend** (from `backend/`):  
   `uvicorn app.main:app --reload`

2. **Generate voice files**  
   Call the reminder endpoint (no auth):
   ```bash
   curl "http://localhost:8000/reminders/send"
   ```
   Only vaccinations that are **due** (due_date ≤ today), **remindable** (due within last 7 days), and **not yet sent** get a voice file. Response: `reminders_sent`, `reminders` (with `audio_url`).

3. **If you get `reminders_sent: 0`** (e.g. all already sent or none due in window):
   ```bash
   cd backend
   python scripts/reset_reminder_for_test.py
   ```
   This resets one due vaccination so the next `/reminders/send` will process it. Then run step 2 again.

4. **Where voice is saved**  
   Files: `backend/media/reminders/vac_<id>_<YYYYMMDD>.mp3`  
   Play in browser: `http://localhost:8000/reminders/audio/<vaccination_id>`

5. **Required for voice**  
   In `backend/.env`: `ELEVENLABS_API_KEY` set and `REMINDER_SEND_VOICE=true`.

---

## Admin Dashboard (Monitor régional, approvisionnement, Telegram)

- **Backend**: modèles `Region`, `NationalStock`, `TelegramLog`, `CoverageReport`; endpoints sous `/admin/*` (JWT admin requis).
- **Frontend**: page `/admin` (français) — sélecteur de vaccin, carte d’approvisionnement, barres de couverture par région, détail région, aperçu/envoi Telegram.
- **Variables d’environnement** : Aucune obligatoire. `TELEGRAM_BOT_TOKEN` et Twilio sont optionnels ; à configurer plus tard si vous ajoutez les envois Telegram/SMS.

### Exemples cURL (remplacer `TOKEN` par un JWT admin)

```bash
# Couverture par région pour un vaccin
curl -s -H "Authorization: Bearer TOKEN" "http://localhost:8000/admin/coverage?vaccine=DTP1"

# Avec actualisation du cache
curl -s -H "Authorization: Bearer TOKEN" "http://localhost:8000/admin/coverage?vaccine=DTP1&refresh=true"

# Approvisionnement
curl -s -H "Authorization: Bearer TOKEN" "http://localhost:8000/admin/supply?vaccine=DTP1"

# Détail d’une région
curl -s -H "Authorization: Bearer TOKEN" "http://localhost:8000/admin/region/1/detail?vaccine=DTP1"

# Générer un aperçu Telegram (sans envoi)
curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"vaccine_name":"DTP1","region_ids":[1,2],"language":"fr","template_type":"summary"}' \
  "http://localhost:8000/admin/telegram/generate"

# Envoyer les messages Telegram
curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"vaccine_name":"DTP1","region_ids":[1],"language":"fr","template_type":"urgent","send":true}' \
  "http://localhost:8000/admin/telegram/send"
```

### Exemple de réponses JSON

**GET /admin/coverage?vaccine=DTP1** (extrait) :
```json
[
  {
    "region_id": 1,
    "region_name": "Tanger-Tétouan-Al Hoceima",
    "population_2024": 4030222,
    "estimated_annual_births": 67300,
    "total_registered": 150,
    "vaccinated_count": 120,
    "coverage_pct": 0.8,
    "coverage_pct_display": 80.0,
    "color": "red",
    "note": null
  }
]
```

**GET /admin/supply?vaccine=DTP1** (extrait) :
```json
{
  "regions": [
    {
      "region_id": 1,
      "region_name": "Tanger-Tétouan-Al Hoceima",
      "births": 67300,
      "projected_need": 63935,
      "with_buffer": 70329,
      "current_stock": 500000,
      "shortage_or_surplus": "surplus"
    }
  ],
  "national": {
    "current_stock": 500000,
    "projected_need_total": 584815,
    "projected_need_with_buffer_total": 643297,
    "surplus": 0,
    "shortage": 84815
  },
  "data_quality_warning": false
}
```

### Seed SQL des 12 régions (Morocco)

Les régions sont insérées au démarrage via `seed_regions.py`. Exemple SQL équivalent :

```sql
INSERT INTO regions (id, name, population_2024, estimated_annual_births, created_at) VALUES
(1, 'Tanger-Tétouan-Al Hoceima', 4030222, 67300, datetime('now')),
(2, 'L''Oriental', 2294665, 38300, datetime('now')),
(3, 'Fès-Meknès', 4467911, 74400, datetime('now')),
(4, 'Rabat-Salé-Kénitra', 5132639, 85700, datetime('now')),
(5, 'Béni Mellal-Khénifra', 2525801, 42200, datetime('now')),
(6, 'Casablanca-Settat', 7688967, 128400, datetime('now')),
(7, 'Marrakech-Safi', 4892393, 81700, datetime('now')),
(8, 'Drâa-Tafilalet', 1655623, 27700, datetime('now')),
(9, 'Souss-Massa', 3020431, 50400, datetime('now')),
(10, 'Guelmim-Oued Noun', 448685, 7500, datetime('now')),
(11, 'Laâyoune-Sakia El Hamra', 451028, 7500, datetime('now')),
(12, 'Dakhla-Oued Ed-Dahab', 219965, 3700, datetime('now'));
```

### Rendre un utilisateur admin

En base SQLite (ou via script) :  
`UPDATE parents SET is_admin = 1 WHERE email = 'admin@example.com';`

### Données de démo (fake data)

Au démarrage, le backend insère des données réalistes si aucune n’existe déjà :
- **10 parents** (e-mails `*@example.ma`), répartis dans plusieurs régions, mot de passe commun : **`Demo123!`**
- **Enfants** avec dates de naissance 2020–2024 et **vaccinations** partiellement complétées (taux par région pour avoir vert / jaune / rouge dans l’admin)
- **Stock national** mis à jour pour les vaccins (BCG, Penta, etc.)

Exemples de connexion : `fatima.elamrani@example.ma` / `Demo123!`, `mohammed.bennani@example.ma` / `Demo123!`. Pour réinsérer les données, supprimer d’abord les parents dont l’e-mail finit par `@example.ma`.
