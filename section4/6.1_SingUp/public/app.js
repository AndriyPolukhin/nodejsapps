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


// 4. Bind the forms
app.bindForms = function () {
  document.querySelector("form").addEventListener("submit", function (e) {
    // 4.1 Stop the form submitting
    e.preventDefault();
    let formId = this.id;
    let path = this.action;
    let method = this.method.toUpperCase();

    // 4.2 Hide the error message (if it's currently show due to a previous error)
    document.querySelector("#" + formId + " .formError").style.display = 'hidden';
    // 4.3 Turn the input into a payload
    let payload = {};
    let elements = this.elements;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type !== 'submit') {
        let valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
        payload[elements[i].name] = valueOfElement;
      }
    }

    // 4.4 Call the API
    app.client.request(undefined, path, method, undefined, payload, function (statusCode, responsePayload) {
      // 4.4.1 Display an error on the form if needed
      if (statusCode !== 200) {
        // 4.4.2 Try to get the error from the api, or set a default erorr message
        let error = typeof (responsePayload.Error) == 'string' ?
          responsePayload.Error : 'An error has occured, plaease try again';

        // 4.4.3 Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = error;
        // 4.4.4 Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = "block";
      } else {
        // 4.4.5 If successful, send to form response processor
        app.formResponseProcessor(formId, payload, responsePayload);
      }
    });
  });
};

// 5. Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  let functionToCall = false;
  if (formId == 'accountCreate') {
    // @Todo: do something here now that the account has been created successfully

    console.log('The acocunt create form was successfully submited');

  }
};

// 6. Init (bootstrapping)
app.init = () => {
  // 6.1 Bind all form submition
  app.bindForms();
};

// 7. Call the init process after the window loads
window.onload = () => {
  app.init();
};
