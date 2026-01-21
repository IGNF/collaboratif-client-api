import { BaseResource } from '../BaseResouce.js';
import { ApiError, ErrorCode } from '../error.js';
import * as validator from '../validator/validator.js';

export class UserDomain extends BaseResource {

  async getUsers(parameters = {}) {
    this.requireAuth();
    validator.validateParams(parameters, 'getUsers');
    return await this.client.doRequest("/users", "get", null, parameters);
  }
}