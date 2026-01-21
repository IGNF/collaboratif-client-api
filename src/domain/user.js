import { BaseResource } from '../BaseResouce.js';
import { ApiError, ErrorCode } from '../error.js';
import * as validator from '../validator/validator.js';

export class UserDomain extends BaseResource {

  /**
   * Récupère tous les utilisateurs (les 10 premiers par defaut)
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(parameters = {}) {
    this.requireAuth();
    validator.validateParams(parameters, 'getUsers');
    return await this.client.doRequest("/users", "get", null, parameters);
  }

  /**
   * Récupère l'utilisateur d'identifiant donné
   * @param {Integer|String} id un identifiant ou "me"
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getUser(id = "me", parameters = []) {
    if (id != "me" && (isNaN(parseInt(id)) || parseInt(id) < 0)) throw new ApiError('id must be "me" or positive number', ErrorCode.USER_ID_INVALID);
    validator.validateParams(parameters, 'getUser');
    return await this.client.doRequest('/users/' + id, "get", null, parameters);
  }

  /**
   * Met a jour un utilisateur sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patchUser(id, body = null, contentType = null) {
    this.requireAuth();
    validator.validateId(id);
    validator.validateBody(body, 'patchUser');
    return await this.client.doRequest('/users/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime l'utilisateur d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async deleteUser(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/users/' + id, "delete");
  }
}