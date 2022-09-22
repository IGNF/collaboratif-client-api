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