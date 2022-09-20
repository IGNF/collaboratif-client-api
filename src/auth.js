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
        if (Date.now() > this.expirationDate) return true;
		return false;
    }

	isTokenRefreshExpired() {
		if (!this.refreshExpirationDate) return true;
		if (Date.now() > this.refreshExpirationDate) return true;
		return false;
	}

    setExpirationDates(tokenExpiresIn, refreshTokenExpiresIn) {
		let now = Date.now();
        this.expirationDate = now.setSeconds(now.getSeconds() + tokenExpiresIn);
		now = Date.now();
		this.refreshExpirationDate = now.setSeconds(now.getSeconds() + refreshTokenExpiresIn);
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
		return await this.axiosInstance.post('/token', tokenParams);
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
		return await this.axiosInstance.post('/token', tokenParams);
	}

    async fetchToken(credentials) {
		if (!credentials) throw 'Have to set credentials first';
		if (!this.token || (this.isTokenExpired() && this.isTokenRefreshExpired())) {
			try {
				let tokenResp = await this.getPrimaryToken(credentials);
				this.processTokenResponse(tokenResp);
				return this.token;
			} catch (error) {
				throw 'Access Token Error: ' + error.message;
			}
		} else if (this.isTokenExpired() && !this.isTokenRefreshExpired()) {
			try {
				let tokenResp = await this.getRefreshToken();
				this.processTokenResponse(tokenResp);
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
				await this.axiosInstance.post('/revoke', revokeParams);
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