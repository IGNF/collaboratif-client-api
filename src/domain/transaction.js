import { BaseResource } from '../BaseResource.js';
import * as validator from '../validator/validator.js';

export class TransactionDomain extends BaseResource {
  /**
   * Récupère toutes les transactions (les 10 premières par defaut)
   * @param {Integer} databaseId l'identifiant de la base de données des transactions
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(databaseId, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateParams(parameters, "getTransactions");
    return await this.client.doRequest('/databases/' + databaseId + '/transactions', "get", null, parameters);
  }

  /**
   * Récupère la transaction d'identifiant donné
   * @param {Integer} databaseId l'identifiant de base de données de la transaction
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(databaseId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateId(id);
    validator.validateParams(parameters, "getTransaction");
    return await this.client.doRequest('/databases/' + databaseId + '/tables/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une transaction
   * @param {Integer} databaseId l'identifiant de base de données de la transaction
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(databaseId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(databaseId);
    validator.validateBody(body, "addTransaction");
    return await this.client.doRequest('/databases/' + databaseId + '/transactions', 'post', body, null, contentType);
  }
}