import './validator.js';
import * as CryptoJS from 'crypto-js';
const axios = require('axios');
const {ResourceOwnerPassword} = require('simple-oauth2');

class ApiClient {
	constructor (authBaseUrl, apiBaseUrl, client_id = null, client_secret = null) {
		if(ApiClient._instance) return ApiClient._instance;
		this.config_auth = {
			client: {
				id: client_id,
				secret: client_secret
			},
			auth: {
				tokenHost: authBaseUrl
			}
		};
		if (typeof(process) !== 'undefined' && typeof(process.env.SECRET) !== 'undefined' && process.env.SECRET){
			this.secret = process.env.secret
		} else {
			this.secret = "A secret not so secret"
		}
		this.accessToken = null;
		this.user = null;
		this.password = null;
		this.axiosInstance = axios.create({
			baseUrl: apiBaseUrl
		})
	}

	setCredentials(username, password) {
		this.user = username;
		this.password = CryptoJS.AES.encrypt(password, this.secret).toString();
	}

	getTokenParams() {
		if (!this.user || !this.password) return null
		return tokenParams = {
			username: this.user,
			password: CryptoJS.AES.decrypt(this.password, this.secret).toString(CryptoJS.enc.Utf8),
			scope: "openid"
		}
	}

	async fetchToken() {
		if (!this.config_auth) throw 'ApiClient must have a client_id and a client_secret';
		if (!this.getTokenParams()) throw 'Have to set credentials first';
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
		} catch (error) {
			throw 'Error revoking access token:' + error.message;
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

export {ApiClient}