/*
* Front End Logic for the application
*
*/


// 1. Container for the front-end application
const app = {};

// 2. Config object
app.config = {
  'sessionToken': false
};

// 3. Ajax Client for the Restful API
app.client = {};

// 3.1 Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // 3.1.1 Setting default to the parameters
  headers = typeof (headers) == 'object' && headers !== null ? headers : {};
  path = typeof (path) == 'string' ? path : '/';
  method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) == 'object' &&
    queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) == 'object' && payload !== null ? payload : {};
  callback = typeof (callback) == 'function' ? callback : false;
  //3.1.2 For each query stirng parameter send, add it to the path
  let requestUrl = `${path}?`;
  let count = 0;
  for (let queryKey in queryStringObject) {
    // 3.1.2-1 Check if it's a real key
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      // 3.1.2-2 If at least one queryString parameter has, already been added, prepend new once with an '&'
      if (counter > 1) {
        requestUrl += '&';
      }
      //3.1.2-3 Add the key value
      requestUrl += queryKey + '=' + queryStringObject[queryKey];
    }
  }
  // 3.1.3 Form the http request as a json type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  // 3.1.4 additional headers, should be added to request
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }
  // 3.1.5 If there's a session token set, add that as a header
  if (app.config.sessoinToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }
  // 3.1.6 When the request returns handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      let statusCode = xhr.status;
      let responseReturned = xhr.responseText;

      // 3.1.7 Use callback if requested
      if (callback) {
        try {
          let parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  }
  // 3.1.8 Send the payload as json
  let payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
}


