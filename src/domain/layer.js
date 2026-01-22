import { BaseResource } from '../BaseResource.js';
import * as validator from '../validator/validator.js';

export class LayerDomain extends BaseResource {
  /**
   * Récupère toutes les couches (les 10 premières par defaut)
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(communityId, parameters = {}) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateParams(parameters, 'getLayers');
    return await this.client.doRequest('/communities/' + communityId + '/layers', "get", null, parameters);
  }

  /**
   * Récupère la couche d'identifiant donné
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(communityId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id);
    validator.validateParams(parameters, 'getLayer');
    return await this.client.doRequest('/communities/' + communityId + '/layers/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une couche
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(communityId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateBody(body, "addLayer");
    return await this.client.doRequest('/communities/' + communityId + '/layers', "post", body, null, contentType);
  }

  /**
   * Met a jour une couche en remplaçant la totalité de l'objet
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(communityId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id)
    validator.validateBody(body, "putLayer");
    return await this.client.doRequest('/communities/' + communityId + '/layers/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour une couche sans remplacer la totalité de l'objet
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(communityId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id)
    validator.validateBody(body, "patchLayer");
    return await this.client.doRequest('/communities/' + communityId + '/layers/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime la couche d'identifiant donné
   * @param {Integer} communityId l'identifiant de groupe auquel est rattachée la couche
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(communityId, id) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id);
    return await this.client.doRequest('/communities/' + communityId + '/layers/' + id, "delete");
  }

}