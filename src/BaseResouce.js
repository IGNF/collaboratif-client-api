import { ApiError, ErrorCode } from './error.js';
export class BaseResource {
  /**
     * @param {Object} client - Instance de ApiClient
     */
  constructor(client) {
    this.client = client;
  }

  /**
   * Vérifie que l'utilisateur est connecté
   * @throws {Error} Si non connecté
   */
  requireAuth() {
    if (this.client.isConnected() === false) {
      throw new ApiError('The request is unauthorized without being connected', ErrorCode.UNAUTHORIZED);
    }
  }
}