Module permettant d'intéragir avec l'api du collaboratif et de gérer l'authentification

Vous devez autoriser les requêtes CORS vers le domaine .ign.fr et vers l'api d'authentification. Exemple pour cordova, dans le fichier config.xml, ajouter:

<pre>
<allow-navigation href="*://*.ign.fr/*" />
<allow-navigation href="https://iam-ign-qa.cegedim.cloud/*" />
</pre>