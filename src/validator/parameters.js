// définition des paramètres existants pour une route donnée de l'api. Permet d'éviter de faire une requête qui va finir en 400
export const parameters = {
	"getPermissions": [
		"fields",
		"page",
		"limit",
        "sort"
	],
    "getLayers": [
		"fields",
		"page",
		"limit",
        "sort"
	],
    "getTables": [
		"fields",
		"page",
		"limit",
        "sort"
	],
    "getColumns": [
		"fields",
		"page",
		"limit",
        "sort"
	],
	"get": [
		"fields"
	],
	"getUsers": [
		"fields",
		"page",
		"limit",
		"sort",
		"username",
		"surname",
		"firstname",
		"email"
	],
	"getCommunities": [
		"fields",
		"page",
		"limit",
        "sort",
		"description",
		"name"
	],
    "getMembers": [
        "roles",
        "fields",
        "page",
        "limit"
    ],
	"getDatabases": [
		"fields",
		"page",
		"limit",
		"sort",
		"name",
		"title",
		"schema"
	],
    "getVersions": [
        "fields",
        "page",
        "limit"
    ],
    "getUploads": [
        "fields",
        "sort",
        "page",
        "limit",
        "status",
        "tablename",
        "format",
        "error_message",
        "date",
        "user"
    ],
    "getTransactions": [
        "fields",
        "sort",
        "page",
        "limit",
        "comment",
        "started_at",
        "finished_at",
        "status",
        "user"
    ],
    "getReports": [
        "author",
        "territory",
        "departements",
        "commune",
        "communities",
        "opening_date",
        "updating_date",
        "closing_date",
        "input_device",
        "comment",
        "status",
        "attributes",
        "box",
        "fields",
        "sort",
        "page",
        "limit"
    ],
    "getGeoservices": [
        "fields",
		"page",
		"limit",
        "sort",
        "description",
        "title",
        "owner"
    ]
};

//parametres existants pour le body
export const fields = {
    "user": [
        "description", 
        "administrator"
    ],
    "community": [
        "name",
        "description",
        "email",
        "attributes",
        "default_comment",
        "active",
        "all_members_can_valid",
        "shared_extractions",
        "shared_georem",
        "offline_allowed",
        "open_without_affiliation",
        "open_with_email"
    ],
    "layer": [
        "opacity",
        "visibility",
        "order",
        "role",
        "snapto",
        "geoservice",
        "table"
    ],
    "member": [
        "profile",
        "active",
        "role",
        "user_id"
    ],
    "database": [
        "title",
        "source",
        "description",
        "licence",
        "fullDownloadAllowed",
        "extent",
        "writableTimeRange",
        "adapter",
        "dbname",
        "schema",
        "host",
        "databaseType",
        "versioning",
        "conflict",
        "port",
        "username",
        "password",
        "territory"
    ],
    "table": [
        "name",
        "title",
        "description",
        "id_name",
        "geometry_name",
        "min_zoom_level",
        "max_zoom_level",
        "tile_zoom_level",
        "position",
        "table_name",
        "style",
        "styles"
    ],
    "transaction": [
        "comment",
        "actions",
        "geometry"
    ],
    "permission": [
        "database",
        "community",
        "table",
        "column",
        "level"
    ],
    "report": [
        "community",
        "geometry",
        "comment",
        "status",
        "sketch",
        "attributes",
        "input_device",
        "device_version"
    ],
    "reply": [
        "title",
        "content",
        "status"
    ],
    "geoservice": [
        "title",
        "type",
        "version",
        "description",
        "url",
        "format",
        "map_extent",
        "min_zoom",
        "max_zoom",
        "input_mask",
        "box_srid",
        "owner",
        "attribution_name",
        "layers",
        "attribution_url",
        "attribution_logo_url",
        "status",
        "allowed_communities"
    ]
};

//parametres obligatoires pour le body
export const mandatoryFields = {
    "community": [
        "name"
    ],
    "layer": [
        "order"
    ],
    "member": [
        "user_id"
    ],
    "table": [
        "name",
        "title",
        "id_name",
        "geometry_name",
        "table_name"
    ],
    "transaction": [
        "comment",
        "actions"
    ],
    "permission": [
        "database",
        "community",
        "level"
    ],
    "report": [
        "geometry"
    ],
    "geoservice": [
        "title",
        "version",
        "url"
    ]
}