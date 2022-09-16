import {ResourceOwnerPassword} from simple-oauth2;
import 'validator.js';
const axios = require('axios');

class ApiClient {
	constructor (client_id = null, client_secret = null) {
		if(ApiClient._instance) return ApiClient._instance;
		this.config_auth = {
			client: {
				id: client_id,
				secret: client_secret
			},
			auth: {
				tokenHost: 'http://127.0.0.1:8080/auth/realms/test/protocol/openid-connect/' //@TODO as parameter
			}
		};
		this.tokenParams = null;
		this.accessToken = null;
		this.axiosInstance = axios.create({
			baseUrl: "http://localhost/collaboratif/gcms/api" //@TODO as parameter
		})
	}

	setCredentials(username, password) {
		this.tokenParams = {
			username: username,
			password: password,
			scope: "openid"
		}
	}

	async fetchToken() {
		if (!this.config_auth) throw 'ApiClient must have a client_id and a client_secret';
		if (!this.tokenParams) throw 'Have to set credentials first';
		if (!this.accessToken) {
			let client = new ResourceOwnerPassword(this.config_auth);
			try {
				return this.accessToken = await client.getToken(this.tokenParams);
			} catch (error) {
				throw 'Access Token Error: ' + error.message;
			}
		}

		if (this.accessToken.expired()) {
			try {
				return this.accessToken = await this.accessToken.refresh();
			} catch (error) {
				throw 'Error refreshing access token: ' + error.message;
			}
		} else {
			return this.accessToken;
		}
	}
	
	async disconnect() {
		try{
			this.tokenParams = null;
			await this.accessToken.revokeAll();
		catch (error) {
			throw 'Error revoking access token': + error.message;
		}
	}
	
	async allUsers(parameters = []) {
		validator.validateParams(parameters);
		let accessToken = await this.fetchToken();
		let response = await this.axiosInstance.get('/users', {
			'params': parameters,
			'headers': {'Authorization': 'Bearer '+accessToken.token}
		});
		let users = await response.json();
		return users;
	}
	
	async getUser(id="me", parameters = []) {
		if (id != "me" && (isNaN(parseInt(id)) || parseInt(id) < 0)) throw 'id must be "me" or positive number'
		validator.validateParams(parameters);
		let accessToken = await this.fetchToken();
		let url = '/users/'+id;
		let response = await this.axiosInstance.get(url, {
			'params': parameters,
			'headers': {'Authorization': 'Bearer '+accessToken.token}
		});
		let user = await response.json();
		return user;
	}
}