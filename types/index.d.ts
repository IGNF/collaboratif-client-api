import { AxiosResponse } from 'axios';

// Types génériques pour les réponses et paramètres de l'API
export type ApiResponse<T = any> = AxiosResponse<T>;
export type RequestParams = Record<string, any>;
export type RequestBody = Record<string, any>;
export type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | string | null;

// Gestion des erreurs
export const ErrorCode: {
  BASE_URL_MISSING: 'BASE_URL_MISSING';
  CLIENT_ID_MISSING: 'CLIENT_ID_MISSING';
  CLIENT_SECRET_MISSING: 'CLIENT_SECRET_MISSING';
  ACCESS_TOKEN_MISSING: 'ACCESS_TOKEN_MISSING';
  TOKEN_EXPIRED: 'TOKEN_EXPIRED';
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED';
  ERROR_REFRESHING_ACCESS_TOKEN: 'ERROR_REFRESHING_ACCESS_TOKEN';
  REFRESH_TOKEN_MISSING: 'REFRESH_TOKEN_MISSING';
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS';
  CONN_ERROR: 'CONN_ERROR';
  CLIENT_CONFIGURATION_ERROR: 'CLIENT_CONFIGURATION_ERROR';
  UNAUTHORIZED: 'UNAUTHORIZED';
  VALIDATION_ERROR: 'VALIDATION_ERROR';
  USER_ID_INVALID: 'USER_ID_INVALID';
};

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

export class ApiError extends Error {
  name: 'ApiError';
  code: ErrorCodeType;
  originalError: Error | null;
  constructor(message: string, code: ErrorCodeType, originalError?: Error | null);
}

/**
 * Gestionnaire d'authentification
 * Récupération du token, rafraîchissement, révocation
 */
export class AuthClient {
  clientId: string;
  clientSecret: string | null;
  expirationDate: Date | null;
  refreshExpirationDate: Date | null;
  token: string | null;
  refreshToken: string | null;
  usesPKCE: boolean;
  usesExternalToken: boolean;
  primaryInProgress: boolean;
  started: boolean;

  /**
   * @param baseUrl ex: https://iam-url/auth/realms/demo/protocol/openid-connect
   * @param clientId
   * @param clientSecret (optionnel, non présent si PKCE)
   */
  constructor(baseUrl: string, clientId: string, clientSecret?: string | null);

  /**
   * Définit un token obtenu via SSO externe
   * @param accessToken - Le token d'accès
   * @param refreshToken - Le refresh token (optionnel)
   * @param expiresIn - Durée de validité en secondes (optionnel, défaut: 43200 -> 12 heures)
   * @param refreshExpiresIn - Durée de validité du refresh token (optionnel)
   */
  setExternalToken(accessToken: string, refreshToken?: string | null, expiresIn?: number, refreshExpiresIn?: number | null): void;

  /** Récupération de l'url de base de l'api d'authentification */
  getBaseUrl(): string;

  /** Renvoie true si le token n'est plus valide, false sinon */
  isTokenExpired(): boolean;

  /** Renvoie true si le refresh token n'est plus valide, false sinon */
  isTokenRefreshExpired(): boolean;

  /**
   * Récupère un token selon les 3 configurations possibles:
   * - Il n'existe pas ou il a expiré avec le refresh token
   * - Il a expiré mais le refresh token est encore valable
   * - Il n'a pas expiré
   * @param credentials ex: {"username": "moi", "password": "topsecret"}
   * @returns la réponse contient la valeur du token seule
   */
  fetchToken(credentials: { username: string; password: string } | null): Promise<string>;

  /** Force l'expiration du token et du refreshToken */
  disconnect(): Promise<void>;
}

// Classes de domaine
export class UserDomain {
  /** Récupère tous les utilisateurs (les 10 premiers par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère l'utilisateur d'identifiant donné
   * @param id un identifiant ou "me"
   */
  get(id?: number | string | 'me', parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Met à jour un utilisateur sans remplacer la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(id: number, body?: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** Supprime l'utilisateur d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;
}

export class DatabaseDomain {
  /** Récupère toutes les bases de données (les 10 premières par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /** Récupère la base de données d'identifiant donné */
  get(id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une base de données
   * @param body
   * @param contentType si besoin autre que json
   */
  add(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une base de données en remplaçant la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une base de données sans remplacer la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** Supprime la base de données d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;
}

export class CommunityDomain {
  /** Récupère toutes les communautés (les 10 premières par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /** Récupère la communauté d'identifiant donné */
  get(id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une communauté
   * @param body
   * @param contentType si besoin autre que json
   */
  add(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une communauté en remplaçant la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une communauté sans remplacer la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** Supprime la communauté d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;
}

export class PermissionDomain {
  /** Récupère toutes les permissions (les 10 premières par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /** Récupère la permission d'identifiant donné */
  get(id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une permission
   * @param body
   * @param contentType si besoin autre que json
   */
  add(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une permission en remplaçant la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une permission sans remplacer la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** Supprime la permission d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;
}

export class GeoserviceDomain {
  /** Récupère tous les géoservices (les 10 premiers par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /** Récupère le géoservice d'identifiant donné */
  get(id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute un géoservice
   * @param body
   * @param contentType si besoin autre que json
   */
  add(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour un géoservice en remplaçant la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour un géoservice sans remplacer la totalité de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** Supprime le géoservice d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;
}

export class ReportDomain {
  /** Récupère toutes les alertes (les 10 premières par défaut) */
  getAll(parameters?: RequestParams): Promise<ApiResponse>;

  /** Récupère l'alerte d'identifiant donné */
  get(id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une alerte
   * Les documents doivent être passés en blob
   */
  add(body: RequestBody): Promise<ApiResponse>;

  /** Met à jour une alerte en remplaçant la totalité de l'objet */
  put(id: number, body: RequestBody): Promise<ApiResponse>;

  /** Met à jour une alerte sans remplacer la totalité de l'objet */
  patch(id: number, body: RequestBody): Promise<ApiResponse>;

  /** Supprime l'alerte d'identifiant donné */
  delete(id: number): Promise<ApiResponse>;

  /**
   * Ajoute un ou plusieurs documents à une alerte (max 4)
   * @param reportId l'identifiant de l'alerte
   */
  addAttachments(reportId: number, body: RequestBody): Promise<ApiResponse>;

  /**
   * Ajoute une réponse à une alerte
   * @param reportId
   * @param body
   * @param contentType si besoin autre que json
   */
  addReply(reportId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
}

export class LayerDomain {
  /**
   * Récupère toutes les couches (les 10 premières par défaut)
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   */
  getAll(communityId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère la couche d'identifiant donné
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   * @param id
   */
  get(communityId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une couche
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   * @param body
   * @param contentType si besoin autre que json
   */
  add(communityId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une couche en remplaçant la totalité de l'objet
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une couche sans remplacer la totalité de l'objet
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Supprime la couche d'identifiant donné
   * @param communityId l'identifiant de groupe auquel est rattachée la couche
   * @param id
   */
  delete(communityId: number, id: number): Promise<ApiResponse>;
}

export class MemberDomain {
  /**
   * Récupère tous les membres (les 10 premiers par défaut)
   * @param communityId l'identifiant du groupe des membres
   */
  getAll(communityId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère le membre d'identifiant donné
   * @param communityId l'identifiant du groupe du membre
   * @param id
   */
  get(communityId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute un membre
   * @param communityId l'identifiant du groupe du membre
   * @param body
   * @param contentType si besoin autre que json
   */
  add(communityId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour un membre en remplaçant la totalité de l'objet
   * @param communityId l'identifiant du groupe du membre
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour un membre sans remplacer la totalité de l'objet
   * @param communityId l'identifiant du groupe du membre
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Supprime le membre d'identifiant donné
   * @param communityId l'identifiant du groupe du membre
   * @param id
   */
  delete(communityId: number, id: number): Promise<ApiResponse>;
}

export class TransactionDomain {
  /**
   * Récupère toutes les transactions (les 10 premières par défaut)
   * @param databaseId l'identifiant de la base de données des transactions
   */
  getAll(databaseId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère la transaction d'identifiant donné
   * @param databaseId l'identifiant de base de données de la transaction
   * @param id
   */
  get(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une transaction
   * @param databaseId l'identifiant de base de données de la transaction
   * @param body
   * @param contentType si besoin autre que json
   */
  add(databaseId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
}

export class TableDomain {
  /**
   * Récupère toutes les tables (les 10 premières par défaut)
   * @param databaseId l'identifiant de la base de données des tables
   */
  getAll(databaseId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère la table d'identifiant donné
   * @param databaseId l'identifiant de base de données de la table
   * @param id
   */
  get(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère le numrec maximum parmi les objets de la table
   * @param databaseId l'identifiant de base de données de la table
   * @param id
   */
  getMaxNumrec(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une table
   * @param databaseId l'identifiant de base de données de la table
   * @param body
   * @param contentType si besoin autre que json
   */
  add(databaseId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une table en remplaçant la totalité de l'objet
   * @param databaseId l'identifiant de base de données de la table
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(databaseId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une table sans remplacer la totalité de l'objet
   * @param databaseId l'identifiant de base de données de la table
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(databaseId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Supprime la table d'identifiant donné
   * @param databaseId l'identifiant de base de données de la table
   * @param id
   */
  delete(databaseId: number, id: number): Promise<ApiResponse>;
}

export class ColumnDomain {
  /**
   * Récupère toutes les colonnes (les 10 premières par défaut)
   * @param databaseId l'identifiant de la base de données des colonnes
   * @param tableId l'identifiant de la table des colonnes
   */
  getAll(databaseId: number, tableId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère la colonne d'identifiant donné
   * @param databaseId l'identifiant de base de données de la colonne
   * @param tableId l'identifiant de la table de la colonne
   * @param id
   */
  get(databaseId: number, tableId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute une colonne
   * @param databaseId l'identifiant de base de données de la colonne
   * @param tableId l'identifiant de la table de la colonne
   * @param body
   * @param contentType si besoin autre que json
   */
  add(databaseId: number, tableId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une colonne en remplaçant la totalité de l'objet
   * @param databaseId l'identifiant de base de données de la colonne
   * @param tableId l'identifiant de la table de la colonne
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  put(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour une colonne sans remplacer la totalité de l'objet
   * @param databaseId l'identifiant de base de données de la colonne
   * @param tableId l'identifiant de la table de la colonne
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Supprime la colonne d'identifiant donné
   * @param databaseId l'identifiant de base de données de la colonne
   * @param tableId l'identifiant de la table de la colonne
   * @param id
   */
  delete(databaseId: number, tableId: number, id: number): Promise<ApiResponse>;
}

export class FeatureDomain {
  /**
   * Récupère tous les objets (les 10 premiers par défaut)
   * @param databaseId l'identifiant de la base de données des objets
   * @param tableId l'identifiant de la table des objets
   */
  getAll(databaseId: number, tableId: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Récupère l'objet d'identifiant donné
   * @param databaseId l'identifiant de base de données de l'objet
   * @param tableId l'identifiant de la table de l'objet
   * @param id
   */
  get(databaseId: number, tableId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;

  /**
   * Ajoute un objet
   * @param databaseId l'identifiant de base de données de l'objet
   * @param tableId l'identifiant de la table de l'objet
   * @param body
   * @param contentType si besoin autre que json
   */
  add(databaseId: number, tableId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Met à jour un objet sans remplacer la totalité de l'objet
   * @param databaseId l'identifiant de base de données de l'objet
   * @param tableId l'identifiant de la table de l'objet
   * @param id
   * @param body
   * @param contentType si besoin autre que json
   */
  patch(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Supprime l'objet d'identifiant donné
   * @param databaseId l'identifiant de base de données de l'objet
   * @param tableId l'identifiant de la table de l'objet
   * @param id
   */
  delete(databaseId: number, tableId: number, id: number): Promise<ApiResponse>;
}

/**
 * Entrée de l'api cliente.
 * La plupart des fonctions sont des raccourcis de la méthode doRequest
 */
export class ApiClient {
  /** Instance du client d'authentification (disponible après setAuthParams) */
  clientAuth: AuthClient | undefined;

  /** Nom d'utilisateur courant (si utilisation de credentials) */
  username: string | null;

  /** Mot de passe encrypté (si utilisation de credentials) */
  password: string | null;

  // Instances des domaines
  user: UserDomain;
  database: DatabaseDomain;
  community: CommunityDomain;
  column: ColumnDomain;
  feature: FeatureDomain;
  geoservice: GeoserviceDomain;
  layer: LayerDomain;
  member: MemberDomain;
  permission: PermissionDomain;
  report: ReportDomain;
  table: TableDomain;
  transaction: TransactionDomain;

  /**
   * @param apiBaseUrl ex: https://espacecollaboratif.ign.fr/gcms/api
   * @param authBaseUrl ex: https://iam-url/auth/realms/demo/protocol/openid-connect
   * @param clientId
   * @param clientSecret
   */
  constructor(apiBaseUrl: string, authBaseUrl?: string | null, clientId?: string | null, clientSecret?: string | null);

  /**
   * Changement de l'url de base de l'api
   * @param baseUrl la nouvelle url de l'api
   * @returns true si l'url a été changée
   */
  setBaseUrl(baseUrl: string): boolean;

  /** Récupération de l'url de base de l'api */
  getBaseUrl(): string;

  /**
   * Changement des paramètres d'authentification
   * @param authBaseUrl la nouvelle url de l'api d'authentification
   * @param clientId le nouveau client id
   * @param clientSecret le nouveau client secret (optionnel, non présent si PKCE)
   * @returns true si l'url a été changée
   */
  setAuthParams(authBaseUrl: string, clientId: string, clientSecret?: string | null): boolean;

  /**
   * On stocke les informations de l'utilisateur pour pouvoir récupérer le token
   * Le mot de passe est stocké encrypté (la variable d'environnement SECRET est utilisée si elle est settée)
   * @param username
   * @param password le mot de passe en clair ou encrypté
   * @param encrypted true si le mot de passe est déjà encrypté
   */
  setCredentials(username: string, password: string, encrypted?: boolean): void;

  /**
   * Configure un token obtenu via SSO externe (PKCE ou autre)
   * Permet d'utiliser l'API sans fournir de credentials
   * @param accessToken - Le token d'accès OAuth2
   * @param refreshToken - Le refresh token (optionnel)
   * @param expiresIn - Durée de validité en secondes (défaut: 43200 -> 12 heures)
   * @param refreshExpiresIn - Durée du refresh token en secondes
   */
  setExternalToken(accessToken: string, refreshToken?: string | null, expiresIn?: number, refreshExpiresIn?: number | null): void;

  /** Déconnexion de l'utilisateur */
  disconnect(): void;

  /**
   * Est-ce qu'un utilisateur est connecté
   * @returns true si un utilisateur est connecté et au moins une requête a été effectuée,
   * null si aucune requête effectuée mais un utilisateur est renseigné (on ne sait pas encore s'il est valide!),
   * false si aucun utilisateur renseigné ou invalide
   */
  isConnected(): boolean | null;

  /**
   * Fait une requête vers l'api collaborative
   * @param url l'url relative qui nous intéresse. ex: /users
   * @param method get/post/patch/put/delete
   * @param body les paramètres post
   * @param params les paramètres get
   * @param contentType
   */
  doRequest(url: string, method: string, body?: RequestBody | null, params?: RequestParams | null, contentType?: ContentType): Promise<ApiResponse>;

  /**
   * Télécharge un document
   * @param url
   */
  getDocument(url: string): Promise<ApiResponse<ArrayBuffer>>;

  // Fonctions gardées pour rétro-compatibilité
  /** @deprecated Utiliser client.user.getAll() */
  getUsers(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.user.get() */
  getUser(id?: number | string | 'me', parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.user.patch() */
  patchUser(id: number, body?: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.user.delete() */
  deleteUser(id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.database.getAll() */
  getDatabases(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.database.get() */
  getDatabase(id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.database.add() */
  addDatabase(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.database.put() */
  putDatabase(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.database.patch() */
  patchDatabase(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.database.delete() */
  deleteDatabase(id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.community.getAll() */
  getCommunities(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.community.get() */
  getCommunity(id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.community.add() */
  addCommunity(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.community.put() */
  putCommunity(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.community.patch() */
  patchCommunity(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.community.delete() */
  deleteCommunity(id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.permission.getAll() */
  getPermissions(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.permission.get() */
  getPermission(id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.permission.add() */
  addPermission(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.permission.put() */
  putPermission(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.permission.patch() */
  patchPermission(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.permission.delete() */
  deletePermission(id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.geoservice.getAll() */
  getGeoservices(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.geoservice.get() */
  getGeoservice(id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.geoservice.add() */
  addGeoservice(body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.geoservice.put() */
  putGeoservice(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.geoservice.patch() */
  patchGeoservice(id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.geoservice.delete() */
  deleteGeoservice(id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.report.getAll() */
  getReports(parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.get() */
  getReport(id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.add() */
  addReport(body: RequestBody): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.put() */
  putReport(id: number, body: RequestBody): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.patch() */
  patchReport(id: number, body: RequestBody): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.delete() */
  deleteReport(id: number): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.addAttachments() */
  addAttachments(reportId: number, body: RequestBody): Promise<ApiResponse>;
  /** @deprecated Utiliser client.report.addReply() */
  addReply(reportId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** @deprecated Utiliser client.layer.getAll() */
  getLayers(communityId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.layer.get() */
  getLayer(communityId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.layer.add() */
  addLayer(communityId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.layer.put() */
  putLayer(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.layer.patch() */
  patchLayer(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.layer.delete() */
  deleteLayer(communityId: number, id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.transaction.getAll() */
  getTransactions(databaseId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.transaction.get() */
  getTransaction(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.transaction.add() */
  addTransaction(databaseId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;

  /** @deprecated Utiliser client.table.getAll() */
  getTables(databaseId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.get() */
  getTable(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.getMaxNumrec() */
  getTableMaxNumrec(databaseId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.add() */
  addTable(databaseId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.put() */
  putTable(databaseId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.patch() */
  patchTable(databaseId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.table.delete() */
  deleteTable(databaseId: number, id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.column.getAll() */
  getColumns(databaseId: number, tableId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.column.get() */
  getColumn(databaseId: number, tableId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.column.add() */
  addColumn(databaseId: number, tableId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.column.put() */
  putColumn(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.column.patch() */
  patchColumn(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.column.delete() */
  deleteColumn(databaseId: number, tableId: number, id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.feature.getAll() */
  getFeatures(databaseId: number, tableId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.feature.get() */
  getFeature(databaseId: number, tableId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.feature.add() */
  addFeature(databaseId: number, tableId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.feature.patch() */
  patchFeature(databaseId: number, tableId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.feature.delete() */
  deleteFeature(databaseId: number, tableId: number, id: number): Promise<ApiResponse>;

  /** @deprecated Utiliser client.member.getAll() */
  getMembers(communityId: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.member.get() */
  getMember(communityId: number, id: number, parameters?: RequestParams): Promise<ApiResponse>;
  /** @deprecated Utiliser client.member.add() */
  addMember(communityId: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.member.put() */
  putMember(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.member.patch() */
  patchMember(communityId: number, id: number, body: RequestBody, contentType?: ContentType): Promise<ApiResponse>;
  /** @deprecated Utiliser client.member.delete() */
  deleteMember(communityId: number, id: number): Promise<ApiResponse>;
}
