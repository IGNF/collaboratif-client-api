const parameters = {
	"allUsers": [
		"sort",
		"fields",
		"page",
		"limit",
		"username",
		"surname",
		"firstname",
		"email"
	],
	"getUser": [
		"fields"
	]
};

function validateParams(params, fct) {
	for (var i in params) {
		if (parameters[fct].indexOf(params[i]) == -1) throw 'Invalid parameter ' +params[i]+ ': must be in [' +parameters[fct].concat(', ')+ ']';
	}
}