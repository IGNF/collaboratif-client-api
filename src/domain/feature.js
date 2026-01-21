import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';
export class FeatureDomain extends BaseResource {
  /**
   * Récupère tous les objets (les 10 premiers par defaut)
   * @param {Integer} databaseId l'identifiant de la base de données des objets
   * @param {Integer} tableId l'identifiant de la table des objets
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(databaseId, tableId, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateParams(parameters, "getFeatures");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/features', "get", null, parameters);
  }

  /**
   * Récupère l objet d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de l objet
   * @param {Integer} tableId l'identifiant de la table de l objet
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(databaseId, tableId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    validator.validateParams(parameters, "getFeature");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/features/' + id, "get", null, parameters);
  }

  /**
   * Ajoute un objet
   * @param {Integer} databaseId l'identifiant de base de données de l objet
   * @param {Integer} tableId l'identifiant de la table de l objet
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(databaseId, tableId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/features', 'post', body, null, contentType);
  }

  /**
   * Met a jour un objet sans remplacer la totalité de l'objet
   * @param {Integer} databaseId l'identifiant de base de données de l objet
   * @param {Integer} tableId l'identifiant de la table de l objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(databaseId, tableId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/features/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime l'objet d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de l objet
   * @param {Integer} tableId l'identifiant de la table de l objet
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(databaseId, tableId, id) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/features/' + id, "delete");
  }
}