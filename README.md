## Introduction

Module permettant d'intéragir avec l'api du collaboratif et de gérer l'authentification
Dépendances axios (http client utilisant les promesses) et crypto-js pour encrypter le mot de passe utilisateur
Si définie, la variable d'environnement SECRET est utilisée pour l'encryptage

## Installation

npm install http://gitlab.dockerforge.ign.fr/collaboratif/collaboratif-client-api.git

Vous devez autoriser les requêtes CORS vers le domaine .ign.fr et vers l'api d'authentification. Exemple pour cordova, dans le fichier config.xml, ajouter:

```
<allow-navigation href="*://*.ign.fr/*" />
<allow-navigation href="https://iam-ign-qa.cegedim.cloud/*" />
```

## Génération documentation:

./node_modules/.bin/jsdoc -d doc src/ README.md

## Exemple d'utilisation:

```

import {ApiClient} from 'collaboratif-client-api';

//ex pour des routes accessibles sans authentification:
let apiClientUnAuth = new ApiClient(
    'https://espacecollaboratif.ign.fr/gcms/api', // l url de base de l api
);
apiClientUnAuth.getReports().then((reportResponse) => console.log(reportResponse.data)); //affichage des 10 premières alertes publiques

//ex avec authentification
let apiClient = new ApiClient(
    'https://espacecollaboratif.ign.fr/gcms/api', // l url de base de l api
    'https://iam-url/auth/realms/demo/protocol/openid-connect', // l url de base pour l'authentification
    clientId,
    clientSecret
);

apiClient.setCredentials("moi", "mon_super_mot_de_passe");

apiClient.getUser().then((userResponse) => console.log(userResponse.data)); //affichage de mes informations utilisateur

apiClient.getLayers("mon_id_de_communaute", {"limit": 2}).then((layersResponse) => console.log(layersResponse.data[0])) //récupération de 2 couches et affichage de la premiere


```

On peut également directement utiliser la route doRequest du client si le raccourci n'est pas défini. (ex: apiClient.doRequest("/communities", "get", null, {"limit": 2}))

## Et ensuite

Une validation sur les paramètres existants est effectuée et sur les paramètres obligatoires à fournir dans le body. Il faudrait ajouter de la validation sur tous les paramètres. Par exemple quand il y a une liste de choix, ou valider la syntaxe pour la bbox etc... Ca permettra d'éviter les requêtes inutiles qui vont finir en 400 si la requête est mal formatée.
Toutes les routes ne sont pas encore présentes, il faudra compléter.