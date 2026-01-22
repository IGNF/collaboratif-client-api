import { BaseResource } from '../BaseResource.js';
import * as validator from '../validator/validator.js';

export class GeoserviceDomain extends BaseResource {
  /**
   * Récupère tous les geoservices (les 10 premiers par defaut)
   * @param {Object} parameters
   * @returns {Promise}
   */
  async getAll(parameters = {}) {
    this.requireAuth();
    validator.validateParams(parameters, 'getGeoservices');
    return await this.client.doRequest('/geoservices', "get", null, parameters);
  }

  /**
   * Récupère le geoservice d'identifiant donné
   * @param {Integer} id
   * @param {Object} parameters
   * @returns {Promise}
   */
  async get(id, parameters = {}) {
    this.requireAuth();
    validator.validateId(id);
    validator.validateParams(parameters, "getGeoservice");
    return await this.client.doRequest('/geoservices/' + id, "get", null, parameters);
  }

  /**
   * Ajoute un geoservice
   * @param {Object} body
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async add(body, contentType = null) {
    this.requireAuth();
    validator.validateBody(body, "addGeoservice");
    return await this.client.doRequest("/geoservices", "post", body, null, contentType);
  }

  /**
   * Met a jour un geoservice en remplaçant la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async put(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "putGeoservice");
    return await this.client.doRequest('/geoservices/' + id, "put", body, null, contentType);
  }

  /**
   * Met a jour un geoservice sans remplacer la totalité de l'objet
   * @param {Integer} id 
   * @param {Object} body 
   * @param {String} contentType si besoin autre que json
   * @returns {Promise}
   */
  async patch(id, body, contentType = null) {
    this.requireAuth();
    validator.validateId(id)
    validator.validateBody(body, "patchGeoservice");
    return await this.client.doRequest('/geoservices/' + id, "patch", body, null, contentType);
  }

  /**
   * Supprime le geoservice d'identifiant donné
   * @param {Integer} id 
   * @returns {Promise}
   */
  async delete(id) {
    this.requireAuth();
    validator.validateId(id);
    return await this.client.doRequest('/geoservices/' + id, "delete");
  }
}