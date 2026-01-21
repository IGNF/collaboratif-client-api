import { BaseResource } from '../BaseResouce.js';
import { ApiError, ErrorCode } from '../error.js';
import * as validator from '../validator/validator.js';

export class DatabaseDomain extends BaseResource {
  /**
   * Récupère toutes les bases de données (les 10 premières par defaut)
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(parameters = []) {
    this.requireAuth();
    validator.validateParams(parameters, 'getDatabases');
    return await this.client.doRequest('/databases', "get", null, parameters);
  }

  /**
   * Récupère la base de données d'identifiant donné
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(id, parameters = []) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateParams(parameters, 'getDatabase');
    return await this.client.doRequest('/databases/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une base de données
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(body, contentType = null) {
    this.requireAuth();
    validator.validateBody(body, "addDatabase");
    return await this.client.doRequest("/databases", "post", body, null, contentType);
  }

  /**
   * Met a jour une base de données en remplacant la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "putDatabase");
    return await this.client.doRequest('/databases/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour une base de données sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "patchDatabase");
    return await this.client.doRequest('/databases/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime la base de données d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/databases/' + id, "delete");
  }
} 