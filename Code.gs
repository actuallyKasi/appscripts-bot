/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 * @param {object} event the event object from Hangouts Chat
 * @return {object} JSON-formatted response
 * @see https://developers.google.com/hangouts/chat/reference/message-formats/events
 */
function onAddToSpace(event) {
  console.info(event);
  var message = 'Thank you for adding me to ';
  if (event.space.type === 'DM') {
    message += 'a DM, ' + event.user.displayName + '!';
  } else {
    message += event.space.displayName;
  }
  return { text: message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 * @param {object} event the event object from Hangouts Chat
 * @see https://developers.google.com/hangouts/chat/reference/message-formats/events
 */
function onRemoveFromSpace(event) {
  console.info(event);
  console.log('Bot removed from ', event.space.name);
}


var CLIENT_ID = '0oamsdaqyQVBFtDlU4x6';
var CLIENT_SECRET = 'Agmjw4FQqkS7J-wY5wcqMKLIpHFc6FfX4Dfztb2m';

/**
 * Authorizes and makes a request to the Dropbox API.
 */
function onMessage(event) {
  var service = getService();
  reset()
  if (service.hasAccess()) {
    Logger.log('Has access')
    var url = 'https://api.dropboxapi.com/2/users/get_current_account';
    var response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },
      method: 'post',
      // The Content-Type header must be set to an empty string when passing no
      // JSON payload.
      contentType: ''
    });
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
    return {
      actionResponse: {
        type: 'REQUEST_CONFIG',
        url: authorizationUrl
      }}  
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  getService().reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth2.createService('Dropbox')
      // Set the endpoint URLs.
      .setAuthorizationBaseUrl('https://dev-332044.okta.com/oauth2/v1/authorize')
      .setTokenUrl('https://dev-332044.okta.com/oauth2/v1/token')   

      // Set the client ID and secret.
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)

      // Set the name of the callback function that should be invoked to
      // complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      // .setPropertyStore(PropertiesService.getUserProperties())

      // Set the response type to code (required).
      .setParam('response_type', 'code');
}


/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
 * Logs the redict URI to register in the Dropbox application settings.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}
