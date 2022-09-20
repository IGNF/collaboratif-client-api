import {AuthClient} from './auth.js';
import {validateParams} from './validator.js';
import * as CryptoJS from 'crypto-js';
const axios = require('axios');

class ApiClient {
	constructor (authBaseUrl = null, apiBaseUrl = null, clientId = null, clientSecret = null) {
		if(ApiClient._instance) return ApiClient._instance;
		if (!authBaseUrl || !apiBaseUrl || !clientId || !clientSecret) throw 'Mandatory parameters are: authBaseUrl, apiBaseUrl, clientId, clientSecret'
		this.clientAuth = new AuthClient(authBaseUrl, clientId, clientSecret)
		this.secret = null
		try {
			this.secret = process.env.SECRET
		} finally {
			if (!this.secret) this.secret = 'A secret not so secret'
		}
		this.accessToken = null;
		this.username = null;
		this.password = null;
		this.axiosInstance = axios.create({
			baseURL: apiBaseUrl
		})
	}

	setCredentials(username, password) {
		if (!username) throw 'No user provided';
		if (!password) throw 'No password provided';
		this.username = username;
		this.password = CryptoJS.AES.encrypt(password, this.secret).toString();
		if (this.username && username != this.username) this.disconnect();
	}
	
	async allUsers(parameters = []) {
		validateParams(parameters);
		return this.doGetRequest('/users', parameters);
	}
	
	async getUser(id="me", parameters = []) {
		if (id != "me" && (isNaN(parseInt(id)) || parseInt(id) < 0)) throw 'id must be "me" or positive number'
		validateParams(parameters);
		let url = '/users/'+id;
		return await this.doGetRequest(url, parameters);
	}

	async doGetRequest(url, parameters) {
		if (!this.username || !this.password) throw 'Have to set credentials first'
		let credentials = {
			username: this.username,
			password: CryptoJS.AES.decrypt(this.password, this.secret).toString(CryptoJS.enc.Utf8)
		};
		let accessToken = await this.clientAuth.fetchToken(credentials);

		let response = await this.axiosInstance.get(url, {
			'params': parameters,
			'headers': {'Authorization': 'Bearer '+accessToken}
		});
		return response.data;
	}
}

export {ApiClient}