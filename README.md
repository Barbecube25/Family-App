# Family-App

## Brandfetch Troubleshooting

Wenn Logos nicht geladen werden:

1. **Dev-Server neu starten:** `.env`-Variablen werden von Vite nur beim Start geladen.
2. **`.env` prüfen:** Die Zeile muss exakt so aussehen:  
   `VITE_BRANDFETCH_KEY=<dein_key>`
3. **Blocker prüfen:** Adblocker / Tracking-Schutz können `api.brandfetch.io` und `cdn.brandfetch.io` blockieren.
