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
  let counter = 0;
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
};

// 4. Bind the logout button
app.bindLogoutButton = function () {
  document.getElementById("logoutButton").addEventListener("click", function (e) {
    // 4.1 Stop it from redirecting anywhere
    e.preventDefault();
    // 4.2 Log the user out
    app.logUserOut();
  });
}

// 5. Log the user out then redirect them
app.logUserOut = () => {
  // 5.1 Get the current token id
  const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // 5.2 Send the currnt token to the tokens endpoint to delete it
  let queryStringObject = {
    'id': tokenId
  }
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
    // 5.3 Set the app.config token as false
    app.setSessionToken(false);

    // 5.4 Send the user to the logged out page
    window.location = '/session/deleted';
  });
};

// 4. Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {
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
  }
};

// 5. Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  // 5.1 Function to call
  let functionToCall = false;

  // 5.2 if account creation was successfull, try to immediately log the user in
  if (formId == 'accountCreate') {

    // 5.3 take the phone and password, and use it to log the user in
    let newPayload = {
      'phone': requestPayload.phone,
      'password': requestPayload.password
    };

    // 5.4 Call the app client
    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
      // 5.5. Display an error on the form if needed
      if (newStatusCode !== 200) {
        // 5.6. Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = 'Sorry, an error has occured. Please try again.';
        // 5.7 Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = 'block';
      } else {
        // if successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);
        window.location = '/checks/all';
      }
    });
  }

  // 5.8 If login was successful, set the token in localstorage and reidrect the user
  if (formId == 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/checks/all';
  }
}

// 6. GET THE SESSIUN TOKEN: from localstorage and set it in the app.config object

app.getSessionToken = () => {
  let tokenString = localStorage.getItem('token');
  if (typeof (tokenString) == 'string') {
    try {
      let token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// 7. Set or remove the loggedIn class from the body
app.setLoggedInClass = (add) => {
  let target = document.querySelector("body");
  if (add) {
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// 8. Set the session token in the app.config object as well as localStorage
app.setSessionToken = (token) => {
  app.config.sessionToken = token;
  let tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  if (typeof (token) == 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// 9. Renew the token
app.renewToken = (callback) => {
  // 9.1 Check the type and proceed if token true
  let currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if (currentToken) {
    // 9.2 Update the token with a new expiration
    let payload = {
      'id': currentToken.id,
      'extend': true
    };
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
      // 9.3 Display an error on the form if needed
      if (statusCode == 200) {
        // 9.4 get the new token details
        let queryStringObject = { 'id': currentToken.id };
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
          // 9.5 Display an error on the form if needed
          if (statusCode == 200) {
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            calolback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// 10. Loop to renew token often
app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken((err) => {
      if (!err) {
        console.log("Token renewed successfully @ " + Date.now());
      }
    });
  }, 1000 * 60);
};




// 11. Init (bootstrapping)
app.init = () => {
  // 11.1 Bind all form submition
  app.bindForms();

  // 11.2 Bind the logout button
  app.bindLogoutButton();

  // 11.3 Get the token from localStorage
  app.getSessionToken();

  // 11.4 Renew Token
  app.tokenRenewalLoop();
};

// 12. Call the init process after the window loads
window.onload = () => {
  app.init();
};
