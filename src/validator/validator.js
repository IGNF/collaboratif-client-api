import {parameters, fields, mandatoryFields} from './parameters';

/**
 * Validation des paramètres get passés dans la requête. 
 * Utilise les parametres du fichier parameters correspondant au nom de la fonction ou aux 3 premiers caractères: (get)
 * Si pas de paramètres correspondants trouvés la validation passera systématiquement
 * @param {Object} params 
 * @param {String} fct 
 * @returns void
 * @throw Exception si un parametre inconnu est trouve
 */
function validateParams(params, fct) {
	let paramList = parameters[fct] ? parameters[fct] : (parameters[fct.substring(0,3)] ? parameters[fct.substring(0,3)] : null);
	if (!paramList) return;
	for (const name in params) {
		if (paramList.indexOf(name) == -1) throw 'Invalid parameter ' + name + ': must be in [' + paramList.concat(', ')+ ']';
	}
}

/**
 * Validation de l'identifiant (nombre positif)
 * @param {Integer} id 
 * @return void
 * @throw Exception si l'id n'est pas un nombre ou s'il est négatif
 */
function validateId(id) {
	if (isNaN(parseInt(id)) || parseInt(id) < 0) throw 'id must be a positive number'
}

/**
 * Validation des noms de champs du body
 * la liste de validation est la meme quelle que soit la methode
 * pour patch pas de validation des parametres obligatoires
 * Si pas de paramètres correspondants trouvés la validation passera systématiquement
 * @param {Object} body 
 * @param {String} fct 
 * @throw Exception si un parametre inconnu est trouve ou si un parametre obligatoire est manquant
 */
function validateBody(body, fct) {
	const objName = fct.replace(/add|put|patch/, '').toLowerCase();
	let fieldsList = fields[objName] ? fields[objName]: null;
	let mandatoryFieldsList = mandatoryFields[objName] ? mandatoryFields[objName]: null;
	if (fieldsList) {
		for (const fieldName in body) {
			if (fieldsList.indexOf(fieldName) == -1 && !(body[fieldName] instanceof Blob)) throw 'Invalid field ' + fieldName + ': must be in [' + fieldsList.concat(', ')+ ']';
		}
	}
	
	if (fct.indexOf("patch") == -1) {
		for (const i in mandatoryFieldsList) {
			if (Object.keys(body).indexOf(mandatoryFieldsList[i]) == -1) throw 'Missing mandatory field ' + mandatoryFieldsList[i];
		}
	}	
}

export {validateParams, validateId, validateBody};