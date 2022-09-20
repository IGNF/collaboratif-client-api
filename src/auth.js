const axios = require('axios');

class AuthClient {
    constructor (baseUrl, clientId, clientSecret) {
        if (!baseUrl) throw 'An authentication url must be provided'
        if (!clientId) throw 'A clientId must be provided'
        this.clientId = clientId;
        if (!clientSecret) throw 'A client secret must be provided'
        this.clientSecret = clientSecret;
        this.expirationDate;
		this.refreshExpirationDate;
        this.token;
        this.refreshToken;
		this.axiosInstance = axios.create({
			baseURL: baseUrl
		})
    }

    isTokenExpired() {
		if (!this.expirationDate) return true;
        if (new Date() > this.expirationDate) return true;
		return false;
    }

	isTokenRefreshExpired() {
		if (!this.refreshExpirationDate) return true;
		if (new Date() > this.refreshExpirationDate) return true;
		return false;
	}

    setExpirationDates(tokenExpiresIn, refreshTokenExpiresIn) {
		let expirationDate = new Date();
		expirationDate.setSeconds(expirationDate.getSeconds() + tokenExpiresIn);
        this.expirationDate = expirationDate;
		let refreshExpirationDate = new Date();
		refreshExpirationDate.setSeconds(refreshExpirationDate.getSeconds() + refreshTokenExpiresIn);
		this.refreshExpirationDate = refreshExpirationDate;
    }

	processTokenResponse(response) {
		this.setExpirationDates(response['expires_in'], response['refresh_expires_in']);
		this.token = response['access_token'];
		this.refreshToken = response['refresh_token'];
	}

	async getPrimaryToken(credentials) {
		if (!credentials['username'] || !credentials['password']) throw 'Credentials must be provided';
		let tokenParams = {
			'username': credentials['username'],
			'password': credentials['password'],
			'client_id': this.clientId,
			'client_secret': this.clientSecret,
			'scope': 'openid',
			'grant_type': 'password'
		}
		const params = new URLSearchParams(tokenParams);
		return await this.axiosInstance.post('/token', params);
	}

	async getRefreshToken() {
		if (!this.refreshToken) throw 'No refresh token found';
		let tokenParams = {
			'client_id': this.clientId,
			'client_secret': this.clientSecret,
			'scope': 'openid',
			'refresh_token': this.refreshToken,
			'grant_type': 'refresh_token'
		}
		const params = new URLSearchParams(tokenParams);
		return await this.axiosInstance.post('/token', params);
	}

    async fetchToken(credentials) {
		if (!credentials) throw 'Have to set credentials first';
		if (!this.token || (this.isTokenExpired() && this.isTokenRefreshExpired())) {
			try {
				let tokenResp = await this.getPrimaryToken(credentials);
				this.processTokenResponse(tokenResp.data);
				return this.token;
			} catch (error) {
				throw 'Access Token Error: ' + error.message;
			}
		} else if (this.isTokenExpired() && !this.isTokenRefreshExpired()) {
			try {
				let tokenResp = await this.getRefreshToken();
				this.processTokenResponse(tokenResp.data);
				return this.token;
			} catch (error) {
				throw 'Error refreshing access token: ' + error.message;
			}
		} else {
			return this.token;
		}
	}
	
	async disconnect() {
		try{
			if (!this.isTokenExpired()){
				let revokeParams = {
					'client_id': this.clientId,
					'client_secret': this.clientSecret,
					'token': this.token
				}
				const params = new URLSearchParams(revokeParams);
				await this.axiosInstance.post('/revoke', params);
			}
			
			this.token = null;
			this.refreshToken = null;
			this.expirationDate = null;
			this.refreshExpirationDate = null;
		} catch (error) {
			throw 'Error revoking access token:' + error.message;
		}
	}
}

export {AuthClient}