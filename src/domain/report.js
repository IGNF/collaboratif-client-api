import { BaseResource } from '../BaseResouce.js';
import * as validator from '../validator/validator.js';

export class ReportDomain extends BaseResource {

  /**
   * Récupère toutes les alertes (les 10 premières par defaut)
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async getAll(parameters = {}) {
    validator.validateParams(parameters, 'getReports');
    return await this.client.doRequest('/reports', "get", null, parameters);
  }

  /**
   * Récupère l'alerte d'identifiant donné
   * @param {Integer} id
   * @param {Object} parameters 
   * @returns {Promise}
   */
  async get(id, parameters = {}) {
    validator.validateId(id)
    validator.validateParams(parameters, 'getReport');
    return await this.client.doRequest('/reports/' + id, "get", null, parameters);
  }

  /**
   * Ajoute une alerte
   * @param {Object} body 
   * documents must be passed as blob
   * @returns {Promise}
   */
  async add(body) {
    this.requireAuth();
    validator.validateBody(body, "addReport");
    validator.validateNbDocs(body);
    return await this.client.doRequest("/reports", "post", body, null, 'multipart/form-data');
  }

  /**
   * Met a jour une alerte en remplaçant la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @returns {Promise}
   */
  async put(id, body) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "putReport");
    validator.validateNbDocs(body);
    return await this.client.doRequest('/reports/' + id, "put", body, null, 'multipart/form-data');
  }

  /**
   * Met a jour une alerte sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @returns {Promise}
   */
  async patch(id, body) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "patchReport");
    return await this.client.doRequest('/reports/' + id, "patch", body);
  }

  /**
   * Supprime l'alerte d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/reports/' + id, "delete");
  }

  /**
   * Ajoute un ou plusieurs documents a une alerte (max 4)
   * @param {Integer} reportId l identifiant de l alerte
   * @returns {Promise}
   */
  async addAttachments(reportId, body) {
    this.requireAuth();
    validator.validateId(reportId);
    validator.validateNbDocs(body);
    return await this.client.doRequest("/reports/" + reportId + "/attachments", "post", body, null, 'multipart/form-data');
  }

  /**
   * Ajoute une reponse a une alerte
   * @param {Integer} reportId
   * @param {Object} body
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async addReply(reportId, body, contentType = null) {
    this.requireAuth();
    validator.validateId(reportId)
    validator.validateBody(body, "addReply");
    return await this.client.doRequest('/reports/' + reportId + '/replies', "post", body, null, contentType);
  }
}