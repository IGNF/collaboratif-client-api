// définition des paramètres existants pour une route donnée de l'api. Permet d'éviter de faire une requête qui va finir en 400
export const parameters = {
	"all": [
		"fields",
		"page",
		"limit",
        "sort"
	],
	"get": [
		"fields"
	],
	"allUsers": [
		"fields",
		"page",
		"limit",
		"sort",
		"username",
		"surname",
		"firstname",
		"email"
	],
	"allCommunities": [
		"fields",
		"page",
		"limit",
        "sort",
		"description",
		"name"
	],
    "allMembers": [
        "roles",
        "fields",
        "page",
        "limit"
    ],
	"allDatabases": [
		"fields",
		"page",
		"limit",
		"sort",
		"name",
		"title",
		"schema"
	],
    "allVersions": [
        "fields",
        "page",
        "limit"
    ],
    "allUploads": [
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
    "allTransactions": [
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
    "allReports": [
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
    ]
}