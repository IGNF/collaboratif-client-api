import parameters from './parameters';

function validateParams(params, fct) {
	let paramList = params[fct] ? params[fct] : (params[fct.substring(0,3)] ? params[fct.substring(0,3)] : null);
	if (!paramList) return;
	for (var i in params) {
		if (paramList.indexOf(params[i]) == -1) throw 'Invalid parameter ' +params[i]+ ': must be in [' +paramList.concat(', ')+ ']';
	}
}

function validateId(id) {
	if (isNaN(parseInt(id)) || parseInt(id) < 0) throw 'id must be a positive number'
}

export {validateParams, validateId};