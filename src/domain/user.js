import { BaseResource } from '../BaseResouce.js';
import { ApiError, ErrorCode } from '../error.js';
import * as validator from '../validator/validator.js';

export class UserDomain extends BaseResource {
  constructor(client) {
    this.client = client;
  }

  async getUsers(parameters = {}) {
    if (this.isConnected() === false) throw new ApiError('The request is unauthorized without being connected', ErrorCode.CONN_ERROR);
    validator.validateParams(parameters, 'getUsers');
    return await this.client.doRequest("/users", "get", null, parameters);
  }
}