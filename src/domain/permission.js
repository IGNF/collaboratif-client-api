import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';

export class PermissionDomain extends BaseResource {
  /**
   * Récupère toutes les permissions (les 10 premières par defaut)
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(parameters = {}) {
    this.requireAuth();
    validator.validateParams(parameters, 'getPermissions');
    return await this.client.doRequest('/permissions', "get", null, parameters);
  }

  /**
   * Récupère la permission d'identifiant donné
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(id, parameters = {}) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateParams(parameters, 'getPermission');
    return await this.client.doRequest('/permissions/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une permission
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(body, contentType = null) {
    this.requireAuth();
    validator.validateBody(body, "addPermission");
    return await this.client.doRequest("/permissions", "post", body, null, contentType);
  }

  /**
   * Met a jour une permission en remplaçant la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "putPermission");
    return await this.client.doRequest('/permissions/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour une permission sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "patchPermission");
    return await this.client.doRequest('/permissions/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime la permission d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/permissions/' + id, "delete");
  }
}