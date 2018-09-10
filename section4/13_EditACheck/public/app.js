/*
* Front End Logic for the application
*
*/

// 1. Container for the front-end application
let app = {};

// 2. Config object
app.config = {
  sessionToken: false
};

// 3. Ajax Client for the Restful API
app.client = {};

// 3.1 Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // 3.1.1 Setting default to the parameters
  headers = typeof (headers) === 'object' && headers !== null ? headers : {};
  path = typeof (path) === 'string' ? path : '/';
  method = typeof (method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) === 'object' &&
    queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) === 'object' && payload !== null ? payload : {};
  callback = typeof (callback) === 'function' ? callback : false;

  // 3.1.2 For each query stirng parameter send, add it to the path
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
      // 3.1.2-3 Add the key value
      requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
    }
  }

  // 3.1.3 Form the http request as a json type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  // 3.1.4 additional headers, should be added to request
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // 3.1.5 If there's a session token set, add that as a header
  if (app.config.sessionToken) {
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
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };

  // 3.1.8 Send the payload as json
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};

// 4. Bind the logout button
app.bindLogoutButton = () => {
  document.getElementById("logoutButton").addEventListener("click", (e) => {

    // 4.1 Stop it from redirecting anywhere
    e.preventDefault();

    // 4.2 Log the user out
    app.logUserOut();
  });
};

// 5. Log the user out then redirect them
app.logUserOut = function (redirectUser) {
  // Set redirectUser to default to true
  redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true;

  // 5.1 Get the current token id
  const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // 5.2 Send the currnt token to the tokens endpoint to delete it
  let queryStringObject = {
    id: tokenId
  };
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
    // 5.3 Set the app.config token as false
    app.setSessionToken(false);

    // 5.4 Send the user to the logged out page
    if (redirectUser) {
      window.location = '/session/deleted';
    }
  });
};

// 4. Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {

    const allForms = document.querySelectorAll("form");
    for (let i = 0; i < allForms.length; i++) {
      allForms[i].addEventListener("submit", function (e) {

        // 4.1 Stop the form submitting
        e.preventDefault();
        let formId = this.id;
        let path = this.action;
        let method = this.method.toUpperCase();

        // 4.2.1 Hide the error message (if it's currently show due to a previous error)
        document.querySelector(`#${formId} .formError`).style.display = 'none';

        // 4.2.2 Hide the success messaage (if it's currently shown due to a previous error)
        if (document.querySelector("#" + formId + " .formSuccess")) {
          document.querySelector("#" + formId + " .formSuccess").style.display = 'none';
        }


        // 4.3 Turn the input into a payload
        let payload = {};
        let elements = this.elements;
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type !== 'submit') {
            // 4.3.1 Determine class of element and set value accordingly
            const classOfElement = typeof (elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            const valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            const elementIsChecked = elements[i].checked;
            // 4.3.2 Override the method of the form if the input's name is _method
            let nameOfElement = elements[i].name;
            if (nameOfElement == '_method') {
              method = valueOfElement;
            } else {
              // 4.3.3 Create an payload field named "method" if the elements name is actually httpmethod
              if (nameOfElement == 'httpmethod') {
                nameOfElement = 'method';
              }
              // 4.3.4 Create an paylaod field named "id" if the elements name is actually uid
              if (nameOfElement == 'uid') {
                nameOfElement = 'id';
              }
              // 4.3.5 If the element has the class "multiselect" add this value(s) as array elements
              if (classOfElement.indexOf('multiselect') > -1) {
                if (elementIsChecked) {
                  payload[nameOfElement] = typeof (payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }
            }
          }
        }


        // 4.4.1 If the method is DELETE, the payload shoulld be a queryStringObject instead
        const queryStringObject = method == 'DELETE' ? payload : {};

        // 4.4 Call the API
        app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
          // 4.4.1 Display an error on the form if needed
          if (statusCode !== 200) {

            if (statusCode == 403) {
              app.logUserOut();
            } else {

              // 4.4.2 Try to get the error from the api, or set a default erorr message
              const error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

              // 4.4.3 Set the formError field with the error text
              document.querySelector("#" + formId + " .formError").innerHTML = error;

              // 4.4.4 Show (unhide) the form error field on the form
              document.querySelector("#" + formId + " .formError").style.display = 'block';
            }
          } else {
            // 4.4.5 If successful, send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload);
          }
        });
      });
    }
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

  // 5.9 IF forms saved successfully and they have success messages , show them
  const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
  if (formsWithSuccessMessages.indexOf(formId) > -1) {
    document.querySelector("#" + formId + " .formSuccess").style.display = 'block';
  }

  // 5.10 If the user just deleted their account, redirect them to the account-delete page
  if (formId == 'accountEdit3') {
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // 5.11 If the user just created a new check successfully, redirect back to the dashboard
  if (formId == 'checksCreate') {
    window.location = '/checks/all';
  }

  // 5.12 If the user just deleted a check, redirect them to the dashboard
  if (formId == 'checksEdit2') {
    window.location = '/checks/all';
  }
};

// 6. GET THE SESSIUN TOKEN: from localstorage and set it in the app.config object
app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token');
  if (typeof (tokenString) == 'string') {
    try {
      const token = JSON.parse(tokenString);
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
      'extend': true,
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
            callback(true);
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

// 10. Load Data on the page
app.loadDataOnPage = () => {
  // 10.1 Get the current page form the body class
  let bodyClasses = document.querySelector("body").classList;
  let primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;
  // 10.2 Logic for account settings page
  if (primaryClass == 'accountEdit') {
    app.loadAccountEditPage();
  }

  // 10.3 Logic for dashboard page
  if (primaryClass == 'checksList') {
    app.loadChecksListPage();
  }

  // 10.4 Logic for check details page
  if (primaryClass == 'checksEdit') {
    app.loadChecksEditPage();
  }
};

// 11. Load the account edit page specifically
app.loadAccountEditPage = () => {
  // 11.1 Get the phone number from the current token, or log the user our if none is there
  let phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if (phone) {
    // 11.2 Fetch the user data
    let queryStringObject = {
      'phone': phone
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode == 200) {
        // 11.3 Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

        // 11.4 Put the hidden phone field into both forms
        let hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhoneNumberInput');
        for (let i = 0; i < hiddenPhoneInputs.length; i++) {
          hiddenPhoneInputs[i].value = responsePayload.phone;
        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// 12. Load the dashboard page specificale
app.loadChecksListPage = () => {
  // 12.1 Get the phone number from the current token, or log the user out if none is there
  const phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if (phone) {
    // 12.2 Fetch the user data
    const queryStringObject = {
      'phone': phone
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode == 200) {

        // 12.3 Determine how many checks the user has
        let allChecks = typeof (responsePayload.checks) == 'object' && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];
        if (allChecks.length > 0) {

          // 12.4 Show each created check as a new row in the table
          allChecks.forEach((checkId) => {
            // 12.5 Get the data for the check
            let newQueryStringObject = {
              'id': checkId
            };
            app.client.request(undefined, 'api/checks', 'GET', newQueryStringObject, undefined, (statusCode, responsePayload) => {
              if (statusCode == 200) {
                let checkData = responsePayload;
                // 12.5 Make the check data into a table row
                let table = document.getElementById("checksListTable");
                let tr = table.insertRow(-1);
                tr.classList.add('checkRow');
                let td0 = tr.insertCell(0);
                let td1 = tr.insertCell(1);
                let td2 = tr.insertCell(2);
                let td3 = tr.insertCell(3);
                let td4 = tr.insertCell(4);
                td0.innerHTML = responsePayload.method.toUpperCase();
                td1.innerHTML = responsePayload.protocol + '://';
                td2.innerHTML = responsePayload.url;
                let state = typeof (responsePayload.state) == 'string' ? responsePayload.state : 'unknown';
                td3.innerHTML = state;
                td4.innerHTML = '<a href="/checks/edit?id=' + responsePayload.id + '">View / Edit / Delete</a>';
              } else {
                console.log("Error trying to load check ID: ", checkId);
              }
            });
          });

          if (allChecks.length < 5) {
            // 12.6 Show the createCheck CTA
            document.getElementById("createCheckCTA").style.display = 'block';
          }
        } else {
          // 12.7 Show 'you have no checks' message
          document.getElementById("noChecksMessage").style.display = 'table-row';

          // 12.8 Show the createCheck CTA
          document.getElementById("createCheckCTA").style.display = 'block';

        }
      } else {
        // 12.9 If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};


// 13. Load the checks edit page specifically
app.loadChecksEditPage = () => {
  // 13.1 Get the checks id from the query string, if none is found then redirect back to dashboard
  const id = typeof (window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  if (id) {
    // 13.2 Fetch the check data
    let queryStringObject = {
      'id': id
    };
    app.client.request(undefined, 'api/checks', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode == 200) {
        // 13.3 Put the hidden id field into both forms
        let hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for (let i = 0; i < hiddenIdInputs.length; i++) {
          hiddenIdInputs[i].value = responsePayload.id;
        }

        // 13.4 Put the data into the top form as values where needed
        document.querySelector("#checksEdit1 .displayIdInput").value = responsePayload.id;
        document.querySelector("#checksEdit1 .displayStateInput").value = responsePayload.state;
        document.querySelector("#checksEdit1 .protocolInput").value = responsePayload.protocol;
        document.querySelector("#checksEdit1 .urlInput").value = responsePayload.url;
        document.querySelector("#checksEdit1 .methodInput").value = responsePayload.method;
        document.querySelector("#checksEdit1 .timeoutInput").value = responsePayload.timeoutSeconds;
        const successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");
        for (let i = 0; i < successCodeCheckboxes.length; i++) {
          if (responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1) {
            successCodeCheckboxes[i].checked = true;
          }
        }
      } else {
        // if the request comes back as something other than 200, redirect back to dashboard
        window.location = '/checks/all';
      }
    });
  } else {
    window.location = '/checks/all';
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

  // 11.5 Load data on page
  app.loadDataOnPage();
};

// 12. Call the init process after the window loads
window.onload = () => {
  app.init();
};
