

/**
 * axios fait automatiquement la conversion objet->json mais pas objet->formData
 * @param {Object} body l'objet à convertir en formdata
 * @param {FormData} formData pour utilisation en recursif
 * @param {String} parentKey pour utilisation en recursif
 * @returns {FormData}
 */
export function objectToFormData(body, formData, parentKey) {
    if (!formData) formData = new FormData();
    let docCounter = 0;
    for (var key in body) {
        let propName = key;
        if (parentKey) propName = parentKey + '[' + key + ']';
        let value = body[key];
        if (value instanceof Blob) {
            docCounter += 1;
            let mimeType = value.type;
            let extension = mimeType.split("/")[1];
            let name = 'document'+docCounter+'.'+extension;
            formData.append(propName, value, name);
        } else if (!value) {
            continue;
        } else if (value instanceof Date || typeof value == "boolean") {
            formData.append(propName, JSON.stringify(value));
        } else if ( 
            typeof(value) === "object"
            && (
                (typeof value.keys === "function" && value.keys()) 
                || (Object.keys(value) && Object.keys(value).length)
            )
        ) {
            objectToFormData(value, formData, propName);
        } else if ( typeof(value) === "object" ) {
            formData.append(propName, JSON.stringify(value));
        } else {
            formData.append(propName, value);
        }			
    }
    return formData;
}
