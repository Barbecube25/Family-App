# Family-App

## Brandfetch Troubleshooting

Die Einkaufsliste lädt Firmenlogos standardmäßig über `logo.clearbit.com` (ohne API-Key).
Optional kann zusätzlich Brandfetch genutzt werden.

Wenn Logos nicht geladen werden und Brandfetch genutzt werden soll:

1. **Dev-Server neu starten:** `.env`-Variablen werden von Vite nur beim Start geladen.
2. **`.env` prüfen:** Die Zeile muss exakt so aussehen:  
   `VITE_BRANDFETCH_KEY=<dein_key>`
3. **Blocker prüfen:** Adblocker / Tracking-Schutz können `api.brandfetch.io` und `cdn.brandfetch.io` blockieren.
