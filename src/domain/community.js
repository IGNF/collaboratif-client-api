import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';

export class CommunityDomain extends BaseResource {
  /**
   * Récupère tous les groupes (les 10 premiers par defaut)
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(parameters = []) {
    this.requireAuth();
    validator.validateParams(parameters, 'getCommunities');
    return await this.client.doRequest('/communities', "get", null, parameters);
  }

  /**
   * Récupère le groupe d'identifiant donné
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(id, parameters = []) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateParams(parameters, 'getCommunity');
    return await this.client.doRequest('/communities/' + id, "get", null, parameters);
  }

  /**
   * Ajoute un groupe
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(body, contentType = null) {
    this.requireAuth();
    validator.validateBody(body, "addCommunity");
    return await this.client.doRequest("/communities", "post", body, null, contentType);
  }

  /**
   * Met a jour un groupe en remplacant la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "putCommunity");
    return await this.client.doRequest('/communities/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour un groupe sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "patchCommunity");
    return await this.client.doRequest('/communities/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime le groupe d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/communities/' + id, "delete");
  }
}