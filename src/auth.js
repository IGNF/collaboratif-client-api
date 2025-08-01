const axios = require('axios');

/**
 * Gestionnaire d'authentification
 * Récupération du token, rafraîchissement, révocation
 */
class AuthClient {
	/**
	 * @constructor
	 * @param {String} baseUrl ex: https://iam-url/auth/realms/demo/protocol/openid-connect
	 * @param {String} clientId 
	 * @param {String} clientSecret 
	 */
    constructor (baseUrl, clientId, clientSecret) {
        if (!baseUrl) throw 'An authentication url must be provided';
        if (!clientId) throw 'A clientId must be provided';
        this.clientId = clientId;
        if (!clientSecret) throw 'A client secret must be provided';
        this.clientSecret = clientSecret;
        this.expirationDate;
		this.refreshExpirationDate;
        this.token;
        this.refreshToken;
		this.axiosInstance = axios.create({
			baseURL: baseUrl
		});
		this.primaryInProgress = false; //si on a une demande de token en cours on temporise histoire de ne pas refaire 50 fois la meme requete
		this.started = false; // au moins une demande de token a été effectuée
    }

	/**
	 * Recuperation de l'url de base de l'api d authentification
	 * @return {String} l url de base de l api d authentification
	 */
	 getBaseUrl() {
		return this.axiosInstance.defaults.baseURL;
	}

	/**
	 * Renvoie true si le token n'est plus valide, false sinon
	 * @returns {Boolean}
	 */
    isTokenExpired() {
		if (!this.expirationDate) return true;
        if (new Date() > this.expirationDate) return true;
		return false;
    }

	/**
	 * Renvoie true si le refresh token n'est plus valide, false sinon
	 * @returns {Boolean}
	 */
	isTokenRefreshExpired() {
		if (!this.refreshExpirationDate) return true;
		if (new Date() > this.refreshExpirationDate) return true;
		return false;
	}

	/**
	 * Calcule et stocke les dates d'expiration du token et du refresh token
	 * @param {Integer} tokenExpiresIn le nombre de secondes dans lesquelles le token va expirer
	 * @param {Integer} refreshTokenExpiresIn le nombre de secondes dans lesquelles le refresh token va expirer
	 */
    setExpirationDates(tokenExpiresIn, refreshTokenExpiresIn) {
		let expirationDate = new Date();
		expirationDate.setSeconds(expirationDate.getSeconds() + tokenExpiresIn);
        this.expirationDate = expirationDate;
		let refreshExpirationDate = new Date();
		refreshExpirationDate.setSeconds(refreshExpirationDate.getSeconds() + refreshTokenExpiresIn);
		this.refreshExpirationDate = refreshExpirationDate;
    }

	/**
	 * Calcule et stoke toutes les informations à récupérer à la suite d'une demande de token: 
	 * le token, le refresh token et les dates d'expiration
	 * @param {Object} response 
	 */
	processTokenResponse(response) {
		this.setExpirationDates(response['expires_in'], response['refresh_expires_in']);
		this.token = response['access_token'];
		this.refreshToken = response['refresh_token'];
	}

	/**
	 * Requête de base de récupération du token
	 * @param {Object} credentials ex: {"username": "moi", "password": "topsecret"}
	 * @return {Promise}
	 */
	async getPrimaryToken(credentials) {
		if (!credentials['username'] || !credentials['password']) throw new Error('Credentials must be provided');
		this.primaryInProgress = true;
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

	/**
	 * Requête de rafraîchissement du token
	 * Besoin d'un refreshToken renseigné et valide
	 * @returns {Promise}
	 */
	async getRefreshToken() {
		if (!this.refreshToken) throw new Error('No refresh token found');
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

	/**
	 * Récupère un token selon les 3 configurations possibles:
	 * Il n'existe pas ou il a expiré avec le refresh token
	 * Il a expiré mais le refresh token est encore valable
	 * Il n'a pas expiré
	 * @param {Object} credentials ex: {"username": "moi", "password": "topsecret"}
	 * @returns {Promise} la reponse contient la valeur du token seule
	 */
    async fetchToken(credentials) {
		this.started = true;
		if (!credentials) throw new Error('Have to set credentials first');
		if( this.primaryInProgress ) {
			await new Promise(r => setTimeout(r, 1000));
		}
		if (!this.token || (this.isTokenExpired() && this.isTokenRefreshExpired())) {
			try {
				let tokenResp = await this.getPrimaryToken(credentials);
				this.primaryInProgress = false;
				this.processTokenResponse(tokenResp.data);
				return this.token;
			} catch (error) {
				error.message = 'Access Token Error: ' + error.message ? error.message : error;
				throw error;
			}
		} else if (this.isTokenExpired() && !this.isTokenRefreshExpired()) {
			try {
				let tokenResp = await this.getRefreshToken();
				this.processTokenResponse(tokenResp.data);
				return this.token;
			} catch (error) {
				error.message = 'Error refreshing access token: ' + error.message ? error.message : error;
				throw error;
			}
		} else {
			return this.token;
		}
	}
	
	/**
	 * Force l'expiration du token et du refreshToken
	 * @return {Promise} contient le resultat de la requete revoke
	 */
	async disconnect() {
		try{
			this.started = false;
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
			error.message = 'Error revoking access token:' + error.message;
			throw error;
		}
	}
}

export {AuthClient}