import { BaseResource } from '../BaseResource.js';
import * as validator from '../validator/validator.js';

export class MemberDomain extends BaseResource {
  /**
     * Récupère tous les membres (les 10 premiers par defaut)
     * @param {Integer} communityId l'identifiant du groupe des membres
     * @param {Object} parameters 
     * @returns {Promise}
     */
  async getAll(communityId, parameters = {}) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateParams(parameters, 'getMembers');
    return await this.client.doRequest('/communities/' + communityId + '/members', "get", null, parameters);
  }

  /**
   * Récupère le membre d'identifiant donné
   * @param {Integer} communityId l'identifiant du groupe du membre
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(communityId, id, parameters = {}) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id);
    validator.validateParams(parameters, 'getMember');
    return await this.client.doRequest('/communities/' + communityId + '/members/' + id, "get", null, parameters);
  }

  /**
   * Ajoute un membre
   * @param {Integer} communityId l'identifiant du groupe du membre
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(communityId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateBody(body, "addMember");
    return await this.client.doRequest('/communities/' + communityId + '/members', "post", body, null, contentType);
  }

  /**
   * Met a jour un membre en remplaçant la totalité de l'objet
   * @param {Integer} communityId l'identifiant du groupe du membre
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(communityId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id)
    validator.validateBody(body, "putMember");
    return await this.client.doRequest('/communities/' + communityId + '/members/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour un membre sans remplacer la totalité de l'objet
   * @param {Integer} communityId l'identifiant du groupe du membre
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(communityId, id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id)
    validator.validateBody(body, "patchMember");
    return await this.client.doRequest('/communities/' + communityId + '/members/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime le membre d'identifiant donné
   * @param {Integer} communityId l'identifiant du groupe du membre
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(communityId, id) {
    this.requireAuth();
    validator.validateId(communityId);
    validator.validateId(id);
    return await this.client.doRequest('/communities/' + communityId + '/members/' + id, "delete");
  }
}