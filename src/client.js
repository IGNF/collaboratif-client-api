import { AuthClient } from './auth.js';
import { objectToFormData } from './utils.js';
import * as validator from './validator/validator.js';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { ApiError, ErrorCode } from './error.js';

import { UserDomain } from './domain/index.js';
import { DatabaseDomain } from './domain/index.js';
import { CommunityDomain } from './domain/index.js';
import { ColumnDomain } from './domain/index.js';
import { FeatureDomain } from './domain/index.js';
import { GeoserviceDomain } from './domain/index.js';
import { LayerDomain } from './domain/index.js';
import { MemberDomain } from './domain/index.js';
import { PermissionDomain } from './domain/index.js';
import { ReportDomain } from './domain/index.js';
import { TableDomain } from './domain/index.js';
import { TransactionDomain } from './domain/index.js';

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
  constructor(apiBaseUrl, authBaseUrl = null, clientId = null, clientSecret = null) {
    if (!apiBaseUrl) throw new ApiError('Mandatory parameter apiBaseUrl is missing.', ErrorCode.BASE_URL_MISSING);
    if (authBaseUrl && clientId) {
      if (!this.setAuthParams(authBaseUrl, clientId, clientSecret)) throw new ApiError('Failed to configure Auth Client', ErrorCode.CLIENT_CONFIGURATION_ERROR);
    }
    this.secret = null
    try {
      this.secret = process.env.SECRET
    } finally {
      if (!this.secret) this.secret = 'A secret not so secret'
    }
    this.axiosInstance = axios.create({
      baseURL: apiBaseUrl
    });

    // Initialiser les ressources
    this._initResources();
  }

  _initResources() {
    this.user = new UserDomain(this);
    this.database = new DatabaseDomain(this);
    this.community = new CommunityDomain(this);
    this.column = new ColumnDomain(this);
    this.feature = new FeatureDomain(this);
    this.geoservice = new GeoserviceDomain(this);
    this.layer = new LayerDomain(this);
    this.member = new MemberDomain(this);
    this.permission = new PermissionDomain(this);
    this.report = new ReportDomain(this);
    this.table = new TableDomain(this);
    this.transaction = new TransactionDomain(this);
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
   * @param {String} clientSecret le nouveau client secret (optionnel, non présent si PKCE)
   * @return {Boolean} true si l'url a été changée
   */
  setAuthParams(authBaseUrl, clientId, clientSecret = null) {
    if (!authBaseUrl || !clientId) return false;
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
     * Configure un token obtenu via SSO externe (PKCE ou autre)
     * Permet d'utiliser l'API sans fournir de credentials
     * @param {String} accessToken - Le token d'accès OAuth2
     * @param {String} refreshToken - Le refresh token (optionnel)
     * @param {Number} expiresIn - Durée de validité en secondes (défaut: 43200 -> 12 heures)
     * @param {Number} refreshExpiresIn - Durée du refresh token en secondes
     */
  setExternalToken(accessToken, refreshToken = null, expiresIn = 43200, refreshExpiresIn = null) {
    if (!this.clientAuth) {
      throw new ApiError('Auth client must be configured first. Call setAuthParams() before setExternalToken()', ErrorCode.CLIENT_CONFIGURATION_ERROR);
    }
    this.clientAuth.setExternalToken(accessToken, refreshToken, expiresIn, refreshExpiresIn);
    // Nettoyer les credentials stockés
    this.username = null;
    this.password = null;
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
   * @returns {Boolean|null} 
   * renvoie true si un utilisateur est connecte et au moins une requete a ete effectuee
   * renvoie null si aucune requête effectuée mais un utilisateur est renseigne (on ne sait pas encore s'il est valide!)
   * false si aucun utilisateur renseigne ou invalide
   */
  isConnected() {
    if (this.clientAuth && this.clientAuth.token) {
      return true;
    } else if (this.username && this.clientAuth && !this.clientAuth.started) {
      return null;
    } else {
      return false
    }
  }

  /**
   * Rajoute la cle headers avec l authorizatoin
   * @param {Object} config 
   */
  async addAuthorization(config) {
    if(!this.clientAuth){
      throw new ApiError('Auth client must be configured first. Call setAuthParams() before adding authorization', ErrorCode.CLIENT_CONFIGURATION_ERROR);
    }
    if (this.clientAuth.usesExternalToken) { // si utilise token externe
      let accessToken = await this.clientAuth.fetchToken(null);
      config["headers"] = { 'Authorization': 'Bearer ' + accessToken };
    }
    else { // si utilise credentials
      if (this.username && this.password) {
        let credentials = {
          username: this.username,
          password: JSON.parse(CryptoJS.AES.decrypt(this.password, this.secret).toString(CryptoJS.enc.Utf8))
        };
        let accessToken = await this.clientAuth.fetchToken(credentials);
        config["headers"] = { 'Authorization': 'Bearer ' + accessToken };
      }
    }
  }

  /**
   * Fait une requête vers l'api collaborative
   * @param {String} url l'url relative qui nous intéresse. ex: /users
   * @param {String} method get/post/patch/put/delete
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

    if (body && ["application/x-www-form-urlencoded", "multipart/form-data"].includes(contentType)) {
      body = objectToFormData(body);
    }

    if (body) {
      config['headers']['Content-Type'] = contentType ? contentType : 'application/json';
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

  // Fonctions gardées pour rétro-compatibilité
  async getUsers(parameters = {}) {
    return await this.user.getAll(parameters);
  }
  async getUser(id = "me", parameters = {}) {
    return await this.user.get(id, parameters);
  }
  async patchUser(id, body = null, contentType = null) {
    return await this.user.patch(id, body, contentType);
  }
  async deleteUser(id) {
    return await this.user.delete(id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getDatabases(parameters = {}) {
    return await this.database.getAll(parameters);
  }
  async getDatabase(id, parameters = {}) {
    return await this.database.get(id, parameters);
  }
  async addDatabase(body, contentType = null) {
    return await this.database.add(body, contentType);
  }
  async putDatabase(id, body, contentType = null) {
    return await this.database.put(id, body, contentType);
  }
  async patchDatabase(id, body, contentType = null) {
    return await this.database.patch(id, body, contentType);
  }
  async deleteDatabase(id) {
    return await this.database.delete(id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getCommunities(parameters = {}) {
    return await this.community.getAll(parameters);
  }
  async getCommunity(id, parameters = {}) {
    return await this.community.get(id, parameters);
  }
  async addCommunity(body, contentType = null) {
    return await this.community.add(body, contentType);
  }
  async putCommunity(id, body, contentType = null) {
    return await this.community.put(id, body, contentType);
  }
  async patchCommunity(id, body, contentType = null) {
    return await this.community.patch(id, body, contentType);
  }
  async deleteCommunity(id) {
    return await this.community.delete(id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getPermissions(parameters = {}) {
    return await this.permission.getAll(parameters);
  }
  async getPermission(id, parameters = {}) {
    return await this.permission.get(id, parameters);
  }
  async addPermission(body, contentType = null) {
    return await this.permission.add(body, contentType);
  }
  async putPermission(id, body, contentType = null) {
    return await this.permission.put(id, body, contentType);
  }
  async patchPermission(id, body, contentType = null) {
    return await this.permission.patch(id, body, contentType);
  }
  async deletePermission(id) {
    return await this.permission.delete(id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getGeoservices(parameters = {}) {
    return await this.geoservice.getAll(parameters);
  }
  async getGeoservice(id, parameters = {}) {
    return await this.geoservice.get(id, parameters);
  }
  async addGeoservice(body, contentType = null) {
    return await this.geoservice.add(body, contentType);
  }
  async putGeoservice(id, body, contentType = null) {
    return await this.geoservice.put(id, body, contentType);
  }
  async patchGeoservice(id, body, contentType = null) {
    return await this.geoservice.patch(id, body, contentType);
  }
  async deleteGeoservice(id) {
    return await this.geoservice.delete(id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getReports(parameters = {}) {
    return await this.report.getAll(parameters);
  }
  async getReport(id, parameters = {}) {
    return await this.report.get(id, parameters);
  }
  async addReport(body) {
    return await this.report.add(body);
  }
  async putReport(id, body) {
    return await this.report.put(id, body);
  }
  async patchReport(id, body) {
    return await this.report.patch(id, body);
  }
  async deleteReport(id) {
    return await this.report.delete(id);
  }
  async addAttachments(reportId, body) {
    return await this.report.addAttachments(reportId, body);
  }
  async addReply(reportId, body, contentType = null) {
    return await this.report.addReply(reportId, body, contentType);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getLayers(communityId, parameters = {}) {
    return await this.layer.getAll(communityId, parameters);
  }
  async getLayer(communityId, id, parameters = {}) {
    return await this.layer.get(communityId, id, parameters);
  }
  async addLayer(communityId, body, contentType = null) {
    return await this.layer.add(communityId, body, contentType);
  }
  async putLayer(communityId, id, body, contentType = null) {
    return await this.layer.put(communityId, id, body, contentType);
  }
  async patchLayer(communityId, id, body, contentType = null) {
    return await this.layer.patch(communityId, id, body, contentType);
  }
  async deleteLayer(communityId, id) {
    return await this.layer.delete(communityId, id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getTransactions(databaseId, parameters = {}) {
    return await this.transaction.getAll(databaseId, parameters);
  }
  async getTransaction(databaseId, id, parameters = {}) {
    return await this.transaction.get(databaseId, id, parameters);
  }
  async addTransaction(databaseId, body, contentType = null) {
    return await this.transaction.add(databaseId, body, contentType);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getTables(databaseId, parameters = {}) {
    return await this.table.getAll(databaseId, parameters);
  }

  async getTable(databaseId, id, parameters = {}) {
    return await this.table.get(databaseId, id, parameters);
  }
  async getTableMaxNumrec(databaseId, id, parameters = {}) {
    return await this.table.getMaxNumrec(databaseId, id, parameters);
  }
  async addTable(databaseId, body, contentType = null) {
    return await this.table.add(databaseId, body, contentType);
  }
  async putTable(databaseId, id, body, contentType = null) {
    return await this.table.put(databaseId, id, body, contentType);
  }
  async patchTable(databaseId, id, body, contentType = null) {
    return await this.table.patch(databaseId, id, body, contentType);
  }
  async deleteTable(databaseId, id) {
    return await this.table.delete(databaseId, id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getColumns(databaseId, tableId, parameters = {}) {
    return await this.column.getAll(databaseId, tableId, parameters);
  }
  async getColumn(databaseId, tableId, id, parameters = {}) {
    return await this.column.get(databaseId, tableId, id, parameters);
  }
  async addColumn(databaseId, tableId, body, contentType = null) {
    return await this.column.add(databaseId, tableId, body, contentType);
  }
  async putColumn(databaseId, tableId, id, body, contentType = null) {
    return await this.column.put(databaseId, tableId, id, body, contentType);
  }
  async patchColumn(databaseId, tableId, id, body, contentType = null) {
    return await this.column.patch(databaseId, tableId, id, body, contentType);
  }
  async deleteColumn(databaseId, tableId, id) {
    return await this.column.delete(databaseId, tableId, id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getFeatures(databaseId, tableId, parameters = {}) {
    return await this.feature.getAll(databaseId, tableId, parameters);
  }
  async getFeature(databaseId, tableId, id, parameters = {}) {
    return await this.feature.get(databaseId, tableId, id, parameters);
  }
  async addFeature(databaseId, tableId, body, contentType = null) {
    return await this.feature.add(databaseId, tableId, body, contentType);
  }
  async patchFeature(databaseId, tableId, id, body, contentType = null) {
    return await this.feature.patch(databaseId, tableId, id, body, contentType);
  }
  async deleteFeature(databaseId, tableId, id) {
    return await this.feature.delete(databaseId, tableId, id);
  }

  // Fonctions gardées pour rétro-compatibilité
  async getMembers(communityId, parameters = {}) {
    return await this.member.getAll(communityId, parameters);
  }
  async getMember(communityId, id, parameters = {}) {
    return await this.member.get(communityId, id, parameters);
  }
  async addMember(communityId, body, contentType = null) {
    return await this.member.add(communityId, body, contentType);
  }
  async putMember(communityId, id, body, contentType = null) {
    return await this.member.put(communityId, id, body, contentType);
  }
  async patchMember(communityId, id, body, contentType = null) {
    return await this.member.patch(communityId, id, body, contentType);
  }
  async deleteMember(communityId, id) {
    return await this.member.delete(communityId, id);
  }
}

export { ApiClient }