/*
* this is the front end logic for the application
*
*/

// 1. Container for the front-end application
const app = {};

// 2. Config
app.config = {
  sessionToken: false
};

// 3. AJAX client for the RESTful API
app.client = {};

// 3.1. Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {
  // 3.1.1 Set the default for all of them
  headers = typeof (headers) == 'object' && headers !== null ? headers : {};
  path = typeof (path) == 'string' ? path : '/';
  method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) == 'object' && payload !== null ? payload : {};
  callback = typeof (callback) == 'function' ? callback : false;

  // 3.1.2 Add the query String Parameters to the path
  // For each query string parameter send, add it to the path
  let requestUrl = `${path}?`;
  let counter = 0;
  for (const queryKey in queryStringObject) {
    // 3.1.2-1 Check if the queryKey is part of the queryStringObject
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      // 3.1.2-2 if at least one query string parameter has alerady been added, prepend new onces with and '&'
      if (counter > 1) {
        requestUrl += '&';
      }
      // 3.1.2-3 Add the key value
      requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
    }
  }
  // 3.1.3 Form the http request as a JSON type
  const xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  // 3.1.4 For each other content-type, we need to add it to the request
  for (const headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }
  // 3.1.5 If there is a current session token set, add it to the header
  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }
  // 3.1.6 When the request commes back, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // 3.1.6-1 Callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };
  // 3.1.7 Send the payload as JSON
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};
