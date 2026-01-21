import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';
export class ColumnDomain extends BaseResource {
  /**
     * Récupère toutes les colonnes (les 10 premières par defaut)
     * @param {Integer} databaseId l'identifiant de la base de données des colonnes
     * @param {Integer} tableId l'identifiant de la table des colonnes
     * @param {Object} parameters 
     * @returns {Promise}
     */
  async getAll(databaseId, tableId, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateParams(parameters, "getColumns");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns', "get", null, parameters);
  }

  /**
   * Récupère la colonne d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de la colonne
   * @param {Integer} tableId l'identifiant de la table de la colonne
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(databaseId, tableId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    validator.validateParams(parameters, "getColumn");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une colonne
   * @param {Integer} databaseId l'identifiant de base de données de la colonne
   * @param {Integer} tableId l'identifiant de la table de la colonne
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(databaseId, tableId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateBody(body, "addColumn");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns', 'post', body, null, contentType);
  }

  /**
   * Met a jour une colonne en remplacant la totalité de l'objet
   * @param {Integer} databaseId l'identifiant de base de données de la colonne
   * @param {Integer} tableId l'identifiant de la table de la colonne
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(databaseId, tableId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    validator.validateBody(body, "putColumn");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour une colonne sans remplacer la totalité de l'objet
   * @param {Integer} databaseId l'identifiant de base de données de la colonne
   * @param {Integer} tableId l'identifiant de la table de la colonne
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
    validator.validateBody(body, "patchColumn");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime la colonne d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de la colonne
   * @param {Integer} tableId l'identifiant de la table de la colonne
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(databaseId, tableId, id) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(tableId);
    validator.validateId(id);
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + tableId + '/columns/' + id, "delete");
  }
}