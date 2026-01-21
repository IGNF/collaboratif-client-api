import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';

export class TableDomain extends BaseResource {
  /**
   * Récupère toutes les tables (les 10 premières par defaut)
   * @param {Integer} databaseId l'identifiant de la base de données des tables
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(databaseId, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateParams(parameters, "getTables");
    return await this.client.doRequest('/databases/' + databaseId + '/tables', "get", null, parameters);
  }

  /**
   * Récupère la table d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(databaseId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    validator.validateParams(parameters, "getTable");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id, "get", null, parameters);
  }

  /**
   * Récupère le numrec maximum parmi les objets de la table
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Integer} id
   * @param {Object} parameters
   * @returns {Promise}
   */
  async getMaxNumrec(databaseId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    validator.validateParams(parameters, "getTableMaxNumrec");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id + '/max-numrec', "get", null, parameters);
  }

  /**
   * Ajoute une table
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(databaseId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateBody(body, "addTable");
    return await this.client.doRequest('/databases/' + databaseId + '/tables', 'post', body, null, contentType);
  }

  /**
   * Met a jour une table en remplaçant la totalité de l'objet
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(databaseId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    validator.validateBody(body, "putTable");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour une table sans remplacer la totalité de l'objet
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(databaseId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    validator.validateBody(body, "patchTable");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime la table d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de la table
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(databaseId, id) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id, "delete");
  }
}