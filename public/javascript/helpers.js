/**
 * returns another instance of the object. Used for copying an object.
 * @param object
 */
function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Appends the given HTML to the location
 * @param location Location where the HTML should be appended to
 * @param html Desired HTML to be added to the location
 */
function appendHtmlToLocation(location, html) {
    $(location).append(html);
}