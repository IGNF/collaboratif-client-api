Module permettant d'intéragir avec l'api du collaboratif et de gérer l'authentification
Dépendances axios (http client utilisant les promesses) et crypto-js pour encrypter le mot de passe utilisateur
Si définie, la variable d'environnement SECRET est utilisée pour l'encryptage

Vous devez autoriser les requêtes CORS vers le domaine .ign.fr et vers l'api d'authentification. Exemple pour cordova, dans le fichier config.xml, ajouter:

<pre>
<allow-navigation href="*://*.ign.fr/*" />
<allow-navigation href="https://iam-ign-qa.cegedim.cloud/*" />
</pre>

Exemple d'utilisation:

<pre>
<script type="text/javascript">
import {ApiClient} from 'collaboratif-client-api';

let apiClient = new ApiClient(
    'https://iam-url/auth/realms/demo/protocol/openid-connect', // l url de base pour l'authentification
    'https://espacecollaboratif.ign.fr/gcms/api', // l url de base de l api
    clientId,
    clientSecret
);

apiClient.setCredentials("moi", "mon_super_mot_de_passe");

apiClient.getUser().then((user) => console.log(user)); //affichage de mes informations utilisateur


let unautreClient = new ApiClient();
unautreClient.getCommunities({"limit": 2}).then((communities) => console.log(communities[0])) //récupération de 2 groupes et affichage du premier

</script>
</pre>

Une validation sur les paramètres existants est effectuée et sur les paramètres obligatoires à fournir dans le body. Il faudrait ajouter de la validation sur tous les paramètres. Par exemple quand il y a une liste de choix, ou pour la bbox valider la syntaxe etc... Ca permettrait d'éviter les requêtes inutiles qui vont finir en 400 si la requête est mal formatée.
Toutes les routes ne sont pas encore présentes, il est possible dans rajouter sur le même modèle ou bien d'utiliser directement la route doRequest du client. (ex: apiClient.doRequest("/communities", "get", null, {"limit": 2}))