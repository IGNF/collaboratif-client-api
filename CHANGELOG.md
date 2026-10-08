# Changelog

## 2.1.0 - 2026-10-07

### Ajouté

- Les départs de `doRequest` et `getDocument` sont espacés à 25 requêtes par seconde par client (`requestsPerSecond`). La valeur `0` désactive cet espacement.
- Un HTTP 429 est renvoyé dans cette file, au plus 3 fois (`maxRetries`). Le délai suit l’en-tête `Retry-After`, ou une seconde s’il est absent. Les autres erreurs ne sont pas rejouées.
- Ces deux réglages sont optionnels, en dernier argument du constructeur `ApiClient`. Sans argument, les défauts 25 et 3 s’appliquent.
