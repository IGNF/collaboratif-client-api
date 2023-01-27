import {AuthClient} from './auth.js';
import * as validator from './validator/validator.js';
import * as CryptoJS from 'crypto-js';
const axios = require('axios');

const CONN_ERROR = 'The request is unauthorized without being connected';

/**
 * Entrée de l'api cliente.
 * La plupart des fonctions sont des raccourcis de la méthode doRequest
 */
class ApiClient {
	/**
	 * @constructor
	 * @param {String} apiBaseUrl ex: https://espacecollaboratif.ign.fr/gcms/api
	 * @param {String} authBaseUrl ex: https://iam-url/auth/realms/demo/protocol/openid-connect
	 * @param {String} clientId 
	 * @param {String} clientSecret 
	 */
	constructor (apiBaseUrl, authBaseUrl = null, clientId = null, clientSecret = null) {
		if (!apiBaseUrl) throw 'Mandatory parameter apiBaseUrl is missing.';
		if (authBaseUrl && clientId && clientSecret) {
			if (!this.setAuthParams(authBaseUrl, clientId, clientSecret)) throw 'Failed to configure Auth Client';		
		}
		this.secret = null
		try {
			this.secret = process.env.SECRET
		} finally {
			if (!this.secret) this.secret = 'A secret not so secret'
		}
		this.axiosInstance = axios.create({
			baseURL: apiBaseUrl
		})
	}

	/**
	 * Changement de l'url de base de l'api
	 * @param {String} baseUrl la nouvelle url de l'api
	 * @return {Boolean} true si l'url a été changée
	 */
	setBaseUrl(baseUrl) {
		if (!baseUrl) return false;
		try {
			this.axiosInstance.defaults.baseURL = baseUrl;
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Recuperation de l'url de base de l'api
	 * @return {String} l url de base de l api
	 */
	getBaseUrl() {
		return this.axiosInstance.defaults.baseURL;
	}

	/**
	 * Changement des parametres d authentification
	 * @param {String} authBaseUrl la nouvelle url de l'api d authentification
	 * @param {String} clientId le nouveau client id
	 * @param {String} clientSecret le nouveau client secret
	 * @return {Boolean} true si l'url a été changée
	 */
	setAuthParams(authBaseUrl, clientId, clientSecret) {
		if (!authBaseUrl || !clientId || !clientSecret) return false;
		try {
			this.disconnect();
			this.clientAuth = new AuthClient(authBaseUrl, clientId, clientSecret)
			
			this.accessToken = null;
			this.username = null;
			this.password = null;
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * On stocke les informations de l utilisateur pour pouvoir récupérer le token
	 * Le mot de passe est stocké encrypté (la variable d'environement SECRET est utilisée si elle est settée)
	 * @param {String} username 
	 * @param {String} password le mot de passe en clair ou encrypte
	 * @param {Boolean} encrypted true si le mot de passe est deja encrypte
	 */
	setCredentials(username, password, encrypted = false) {
		if (!username) throw new Error('No user provided');
		if (!password) throw new Error('No password provided');
		this.username = username;
		if (!encrypted) {
			this.password = CryptoJS.AES.encrypt(JSON.stringify(password), this.secret).toString();
		} else {
			this.password = password;
		}
		
		if (this.username && username != this.username) this.disconnect();
	}

	/**
	 * Deconnexion de l utilisateur
	 * @return void
	 */
	disconnect() {
		if (!this.clientAuth) return;
		this.clientAuth.disconnect();
	}

	/**
	 * Est ce qu un utilisateur est connecte
	 * (si au moins une requete vers l api collaborative a ete faite)
	 * @returns {Boolean} true si un utilisateur est connecte
	 */
	isConnected() {
		return (this.clientAuth && this.clientAuth.token) ? true : false;
	}

	/**
	 * Rajoute la cle headers avec l authorizatoin
	 * @param {Object} config 
	 */
	async addAuthorization(config) {
		if (this.username && this.password) {
			let credentials = {
				username: this.username,
				password: JSON.parse(CryptoJS.AES.decrypt(this.password, this.secret).toString(CryptoJS.enc.Utf8))
			};
			let accessToken = await this.clientAuth.fetchToken(credentials);
			config["headers"] = {'Authorization': 'Bearer '+accessToken};
		}
	}

	/**
	 * Fait une requête vers l'api collaborative
	 * @param {String} url l'url relative qui nous intéresse. ex: /users
	 * @param {String} method get/post/patch/put/relete
	 * @param {Object} body les paramètres post 
	 * @param {Object} params les paramètres get
	 * @param {Array<function>} transformRequest une fonction pouvant transformer les donnees ou le header ex: [function (data, headers) {// Do whatever you want to transform the data   return data; }]
	 * @returns {Promise}
	 */
	async doRequest(url, method, body = null, params = null, contentType = 'application/json') {
		let config = {
			url: url,
			method: method,
			params: params
		};

		await this.addAuthorization(config);

		if (body) {
			config['headers']['Content-Type'] = contentType
			config.data = body;
		}
		let response = await this.axiosInstance.request(config);
		return response;
	}

	/**
	 * Telecharge un document
	 * @param url
	 * @return {Promise}
	 */
	async getDocument(url) {
		let config = {
			url: url,
			method: "GET",
			responseType: "arraybuffer"
		};

		await this.addAuthorization(config);
		return await this.axiosInstance.request(config);
	}
	
	/**
	 * Récupère tous les utilisateurs (les 10 premiers par defaut)
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getUsers(parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateParams(parameters, 'getUsers');
		return await this.doRequest("/users", "get", null, parameters);
	}
	
	/**
	 * Récupère l'utilisateur d'identifiant donné
	 * @param {Integer|String} id un identifiant ou "me"
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getUser(id="me", parameters = []) {
		if (id != "me" && (isNaN(parseInt(id)) || parseInt(id) < 0)) throw 'id must be "me" or positive number'
		validator.validateParams(parameters, 'getUser');
		let url = '/users/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Met a jour un utilisateur sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchUser(id, body = null) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, 'patchUser');
		let url = '/users/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime l'utilisateur d'identifiant donné
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async deleteUser(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/users/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère toutes les bases de données (les 10 premières par defaut)
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getDatabases(parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateParams(parameters, 'getDatabases');
		return await this.doRequest('/databases', "get", null, parameters);
	}
	
	/**
	 * Récupère la base de données d'identifiant donné
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getDatabase(id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateParams(parameters, 'getDatabase');
		let url = '/databases/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une base de données
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addDatabase(body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateBody(body, "addDatabase");
		return await this.doRequest("/databases", "post", body);
	}

	/**
	 * Met a jour une base de données en remplacant la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putDatabase(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "putDatabase");
		let url = '/databases/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une base de données sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchDatabase(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "patchDatabase");
		let url = '/databases/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime la base de données d'identifiant donné
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteDatabase(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/databases/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère tous les groupes (les 10 premiers par defaut)
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getCommunities(parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateParams(parameters, 'getCommunities');
		return await this.doRequest('/communities', "get", null, parameters);
	}
	
	/**
	 * Récupère le groupe d'identifiant donné
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getCommunity(id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateParams(parameters, 'getCommunity');
		let url = '/communities/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute un groupe
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addCommunity(body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateBody(body, "addCommunity");
		return await this.doRequest("/communities", "post", body);
	}

	/**
	 * Met a jour un groupe en remplacant la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putCommunity(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "putCommunity");
		let url = '/communities/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour un groupe sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchCommunity(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "patchCommunity");
		let url = '/communities/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime le groupe d'identifiant donné
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteCommunity(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/communities/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère toutes les permissions (les 10 premières par defaut)
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getPermissions(parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateParams(parameters, 'getPermissions');
		return await this.doRequest('/permissions', "get", null, parameters);
	}
	
	/**
	 * Récupère la permission d'identifiant donné
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getPermission(id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateParams(parameters, 'getPermission');
		let url = '/permissions/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une permission
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addPermission(body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateBody(body, "addPermission");
		return await this.doRequest("/permissions", "post", body);
	}

	/**
	 * Met a jour une permission en remplaçant la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putPermission(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "putPermission");
		let url = '/permissions/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une permission sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchPermission(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "patchPermission");
		let url = '/permissions/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime la permission d'identifiant donné
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deletePermission(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/permissions/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère tous les geoservices (les 10 premiers par defaut)
	 * @param {Object} parameters
	 * @returns {Promise}
	 */
	async getGeoservices(parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateParams(parameters, 'getGeoservices');
		return await this.doRequest('/geoservices', "get", null, parameters);
	}

	/**
	 * Récupère le geoservice d'identifiant donné
	 * @param {Integer} id
	 * @param {Object} parameters
	 * @returns {Promise}
	 */
	async getGeoservice(id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		validator.validateParams(parameters, "getGeoservice");
		let url = '/geoservices/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute un geoservice
	 * @param {Object} body
	 * @returns {Promise}
	 */
	async addGeoservice(body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateBody(body, "addGeoservice");
		return await this.toRequest("/geoservices", "post", body);
	}

	/**
	 * Met a jour un geoservice en remplaçant la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	 async putGeoservice(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "putGeoservice");
		let url = '/geoservices/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour un geoservice sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchGeoservice(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "patchGeoservice");
		let url = '/geoservices/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime le geoservice d'identifiant donné
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteGeoservice(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/geoservices/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère toutes les alertes (les 10 premières par defaut)
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getReports(parameters = []) {
		validator.validateParams(parameters, 'getReports');
		return await this.doRequest('/reports', "get", null, parameters);
	}
	
	/**
	 * Récupère l'alerte d'identifiant donné
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getReport(id, parameters = []) {
		validator.validateId(id)
		validator.validateParams(parameters, 'getReport');
		let url = '/reports/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une alerte
	 * @param {Object} body 
	 * documents must be passed as blob
	 * @returns {Promise}
	 */
	async addReport(body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateBody(body, "addReport");
		let formData = new FormData();
		let docCounter = 0;
		for (var key in body) {
			let value = body[key];
			if (typeof(body[key]) === "object" && !(body[key] instanceof Blob)) {
				value = JSON.stringify(body[key]);
			}
			if (body[key] instanceof Blob) {
				docCounter += 1;
				if (docCounter > 4) throw 'Maximum 4 documents';
				let mimeType = body[key].type;
				let extension = mimeType.split("/")[1];
				let name = 'document'+docCounter+'.'+extension;
				formData.append(key, value, name);
			} else {
				formData.append(key, value);
			}			
		}
		
		return await this.doRequest("/reports", "post", formData, null, 'multipart/form-data');
	}

	/**
	 * Met a jour une alerte en remplaçant la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putReport(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "putReport");
		let url = '/reports/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une alerte sans remplacer la totalité de l'objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchReport(id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id)
		validator.validateBody(body, "patchReport");
		let url = '/reports/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime l'alerte d'identifiant donné
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteReport(id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(id);
		let url = '/reports/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Ajoute une reponse a une alerte
	 * @param {Integer} reportId
	 * @param {Object} body
	 * @returns {Promise}
	 */
	async addReply(reportId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(reportId)
		validator.validateBody(body, "addReply");
		let url = '/reports/'+reportId+'/replies';
		return await this.doRequest(url, "post", body);
	}

	/**
	 * Récupère toutes les couches (les 10 premières par defaut)
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getLayers(communityId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateParams(parameters, 'getLayers');
		let url = '/communities/'+communityId+'/layers';
		return await this.doRequest(url, "get", null, parameters);
	}
	
	/**
	 * Récupère la couche d'identifiant donné
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getLayer(communityId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id);
		validator.validateParams(parameters, 'getLayer');
		let url = '/communities/'+communityId+'/layers/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une couche
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addLayer(communityId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateBody(body, "addLayer");
		let url = '/communities/'+communityId+'/layers';
		return await this.doRequest(url, "post", body);
	}

	/**
	 * Met a jour une couche en remplaçant la totalité de l'objet
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putLayer(communityId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id)
		validator.validateBody(body, "putLayer");
		let url = '/communities/'+communityId+'/layers/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une couche sans remplacer la totalité de l'objet
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchLayer(communityId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id)
		validator.validateBody(body, "patchLayer");
		let url = '/communities/'+communityId+'/layers/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime la couche d'identifiant donné
	 * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteLayer(communityId, id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id);
		let url = '/communities/'+communityId+'/layers/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère toutes les transactions (les 10 premières par defaut)
	 * @param {Integer} databaseId l'identifiant de la base de données des transactions
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getTransactions(databaseId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateParams(parameters, "getTransactions");
		let url = '/databases/'+databaseId+'/transactions';
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Récupère la transaction d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de la transaction
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getTransaction(databaseId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		validator.validateParams(parameters, "getTransaction");
		let url = '/databases/'+databaseId+'/tables/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une transaction
	 * * @param {Integer} databaseId l'identifiant de base de données de la transaction
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addTransaction(databaseId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateBody(body, "addTransaction");
		let url = '/databases/'+databaseId+'/transactions';
		return await this.doRequest(url, 'post', body);
	}

	/**
	 * Récupère toutes les tables (les 10 premières par defaut)
	 * @param {Integer} databaseId l'identifiant de la base de données des tables
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getTables(databaseId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateParams(parameters, "getTables");
		let url = '/databases/'+databaseId+'/tables';
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Récupère la table d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getTable(databaseId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		validator.validateParams(parameters, "getTable");
		let url = '/databases/'+databaseId+'/tables/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Récupère le numrec maximum parmi les objets de la table
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Integer} id
	 * @param {Object} parameters
	 * @returns {Promise}
	 */
	async getTableMaxNumrec(databaseId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		validator.validateParams(parameters, "getTableMaxNumrec");
		let url = '/databases/'+databaseId+'/tables/'+id+'/max-numrec';
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une table
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addTable(databaseId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateBody(body, "addTable");
		let url = '/databases/'+databaseId+'/tables';
		return await this.doRequest(url, 'post', body);
	}

	/**
	 * Met a jour une table en remplaçant la totalité de l'objet
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putTable(databaseId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		validator.validateBody(body, "putTable");
		let url = '/databases/'+databaseId+'/tables/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une table sans remplacer la totalité de l'objet
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchTable(databaseId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		validator.validateBody(body, "patchTable");
		let url = '/databases/'+databaseId+'/tables/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime la table d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de la table
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteTable(databaseId, id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(id);
		let url = '/databases/'+databaseId+'/tables/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère toutes les colonnes (les 10 premières par defaut)
	 * @param {Integer} databaseId l'identifiant de la base de données des colonnes
	 * @param {Integer} tableId l'identifiant de la table des colonnes
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getColumns(databaseId, tableId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateParams(parameters, "getColumns");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns';
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Récupère la colonne d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de la colonne
	 * @param {Integer} tableId l'identifiant de la table de la colonne
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getColumn(databaseId, tableId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		validator.validateParams(parameters, "getColumn");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute une colonne
	 * @param {Integer} databaseId l'identifiant de base de données de la colonne
	 * @param {Integer} tableId l'identifiant de la table de la colonne
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addColumn(databaseId, tableId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateBody(body, "addColumn");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns';
		return await this.doRequest(url, 'post', body);
	}

	/**
	 * Met a jour une colonne en remplacant la totalité de l'objet
	 * @param {Integer} databaseId l'identifiant de base de données de la colonne
	 * @param {Integer} tableId l'identifiant de la table de la colonne
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putColumn(databaseId, tableId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		validator.validateBody(body, "putColumn");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour une colonne sans remplacer la totalité de l'objet
	 * @param {Integer} databaseId l'identifiant de base de données de la colonne
	 * @param {Integer} tableId l'identifiant de la table de la colonne
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchColumn(databaseId, tableId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		validator.validateBody(body, "patchColumn");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime la colonne d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de la colonne
	 * @param {Integer} tableId l'identifiant de la table de la colonne
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteColumn(databaseId, tableId, id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/columns/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère tous les objets (les 10 premiers par defaut)
	 * @param {Integer} databaseId l'identifiant de la base de données des objets
	 * @param {Integer} tableId l'identifiant de la table des objets
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getFeatures(databaseId, tableId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateParams(parameters, "getFeatures");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/features';
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Récupère l objet d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de l objet
	 * @param {Integer} tableId l'identifiant de la table de l objet
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getFeature(databaseId, tableId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		validator.validateParams(parameters, "getFeature");
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/features/'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute un objet
	 * @param {Integer} databaseId l'identifiant de base de données de l objet
	 * @param {Integer} tableId l'identifiant de la table de l objet
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addFeature(databaseId, tableId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/features';
		return await this.doRequest(url, 'post', body);
	}

	/**
	 * Met a jour un objet sans remplacer la totalité de l'objet
	 * @param {Integer} databaseId l'identifiant de base de données de l objet
	 * @param {Integer} tableId l'identifiant de la table de l objet
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchFeature(databaseId, tableId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/features/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime l'objet d'identifiant donné
	 * @param {Integer} databaseId l'identifiant de base de données de l objet
	 * @param {Integer} tableId l'identifiant de la table de l objet
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteFeature(databaseId, tableId, id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(databaseId);
		validator.validateId(tableId);
		validator.validateId(id);
		let url = '/databases/'+databaseId+'/tables/'+tableId+'/features/'+id;
		return await this.doRequest(url, "delete");
	}

	/**
	 * Récupère tous les membres (les 10 premiers par defaut)
	 * @param {Integer} communityId l'identifiant du groupe des membres
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getMembers(communityId, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateParams(parameters, 'getMembers');
		let url = '/communities/'+communityId+'/members';
		return await this.doRequest(url, "get", null, parameters);
	}
	
	/**
	 * Récupère le membre d'identifiant donné
	 * @param {Integer} communityId l'identifiant du groupe du membre
	 * @param {Integer} id
	 * @param {Object} parameters 
	 * @returns {Promise}
	 */
	async getMember(communityId, id, parameters = []) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id);
		validator.validateParams(parameters, 'getMember');
		let url = '/communities/'+communityId+'/members'+id;
		return await this.doRequest(url, "get", null, parameters);
	}

	/**
	 * Ajoute un membre
	 * @param {Integer} communityId l'identifiant du groupe du membre
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async addMember(communityId, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateBody(body, "addMember");
		let url = '/communities/'+communityId+'/members';
		return await this.doRequest(url, "post", body);
	}

	/**
	 * Met a jour un membre en remplaçant la totalité de l'objet
	 * @param {Integer} communityId l'identifiant du groupe du membre
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async putMember(communityId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id)
		validator.validateBody(body, "putMember");
		let url = '/communities/'+communityId+'/members/'+id;
		return await this.doRequest(url, "put", body);
	}

	/**
	 * Met a jour un membre sans remplacer la totalité de l'objet
	 * @param {Integer} communityId l'identifiant du groupe du membre
	 * @param {Integer} id 
	 * @param {Object} body 
	 * @returns {Promise}
	 */
	async patchMember(communityId, id, body) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id)
		validator.validateBody(body, "patchMember");
		let url = '/communities/'+communityId+'/members/'+id;
		return await this.doRequest(url, "patch", body);
	}

	/**
	 * Supprime le membre d'identifiant donné
	 * @param {Integer} communityId l'identifiant du groupe du membre
	 * @param {Integer} id 
	 * @returns {Promise}
	 */
	async deleteMember(communityId, id) {
		if (!this.isConnected()) throw new Error(CONN_ERROR);
		validator.validateId(communityId);
		validator.validateId(id);
		let url = '/communities/'+communityId+'/members/'+id;
		return await this.doRequest(url, "delete");
	}
}

export {ApiClient}