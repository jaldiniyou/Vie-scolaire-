# Vie-scolaire-
la gestion de la vie scolaire

## Serveur MCP Google Search Console

Le fichier `.mcp.json` déclare le serveur [mcp-gsc](https://github.com/AminForou/mcp-gsc) pour Claude Code.

1. Installer [uv](https://docs.astral.sh/uv/) : `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Dans Google Cloud Console : activer l'API Search Console, créer un **compte de service** et télécharger sa clé JSON.
3. Dans Search Console → Paramètres → Utilisateurs et autorisations : ajouter l'e-mail du compte de service.
4. Placer la clé dans `secrets/service_account.json` (ignoré par git), ou définir la variable `GSC_CREDENTIALS_PATH` avec son chemin.
5. Lancer `claude` dans le dossier du projet et accepter le serveur `gsc`, puis demander par exemple « liste mes propriétés Search Console ».
