/*
* Front End Logic for the application
*
*/

// 1. CONTAINER
let app = {};

// 2. CONFIG OBJECT
app.config = {
    sessionToken: false;
};

// 3. AJAX CLIENT for the REST API
app.client = {};

// 3.1 ITERFACE: for the api calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    // 3.1.1 Type check of the parameters
    headers = typeof (headers) === 'object' && headers !== null ? headers : {};
    path = typeof (path) === 'string' ? path : '/';
    method = typeof (method) === 'string'
        && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ?
        method.toUpperCase() : 'GET';
    queryStringObject = typeof (queryStringObject) === 'object' &&
        queryStringObject !== null ?
        queryStringObject : {};
    payload = typeof (payload) == 'object' &&
        payload !== null ? payload : {};
    callback = typeof (callback) == 'function' ? callback : false;

    // 3.1.2 Add each query string parameter to the PATH
    let requestUrl = `${path}?`;
    let counter = 0;
    for (let queryKey in queryStringObject) {
        // 3.1.3 Check if it's a real key
        if (queryStringObject.hasOwnProperty(queryKey)) {
            conunter++;
            // 3.1.4 If there's already a parameter, add next one with a '&'
            if (counter > 0) {
                requestUrl += '&';
            }
            // 3.1.5 Add the key value
            requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
        }
    }
    // 3.1.5 Form the http request as a json type
    let xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // 3.1.6 Add all the other headers to the request if any
    for (let headerKey in headers) {
        if (headres.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }
    // 3.1.7 If there's a session token, add it to the header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }
    // 3.1.8 Handler the response of the request
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let statusCode = xhr.status;
            let responseReturned = xhr.responseText;
            // 3.1.9 USE Callback if requested
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

    // 3.1.10. Send the payload as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};

// 4. BIND THE LOGOUT BUTTON
app.bindLogoutButton = () => {
    documnet.getElementById("logoutButton").addEventListener("click", (e) => {
        // 4.1 Stop it from redirecting
        e.preventDefault();

        // 4.2 Log the user out
        app.logUserOut();
    });
};

// 5. LOG OUT USER IF REDIRECTED
app.logUserOut = (redirectUser) => {
    // 5.1 Set the redirectUser to true as default
    redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true;

    // 5.2 Fetch the token id
    const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

    // 5.3 Send the token id to the endpoint in order to delete it
    let queryStringObject = {
        'id': tokenId
    };
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
        // 5.3.1 Set the token as false
        app.setSessionToken(false);
        // 5.3.2 Send the user to loggout page
        if (redirectUser) {
            window.location = '/session/deleted';
        }
    });
};

// 6. BIND FORMS
app.bindForms = function() {
    if (document.querySelector("form")) {
        // 6.1 SELECT ALL FORMS and addEventListener
        const allForms = document.querySelectorAll("form");
        for (let i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener("submit", function(e) {
                // 6.2 Set the parameters
                e.preventDefault();
                let formId = this.id;
                let path = this.action;
                let method = this.method.toUpperCase();

                // 6.3 HIDE ERROR MESSAGE
                document.querySelector(`#${formId} .formError`).style.display = 'none';
                // 6.4 HIDE SUCCESS MESSAGE
                if (document.querySelector(`#${formId} .formSuccess`)) {
                    document.querySelector(`#${formId} .formSuccess`).style.display = 'none';
                }
                // 6.5 TURN INPUT INTO PAYLOAD
                let payload = {};
                let elements = this.elements;
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].type !== "submit") {
                        // 6.5.1 Determine the class of element and set it accoringly
                        const classOfElement = typeof (elements[i].classList.value) == 'string' &&
                            elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                        const valueOfElement = elements[i].type == 'checkbox' &&
                            classOfElement.indexOf('multiselect') == -1 ?
                            elements[i].checked : classOfElement.indexOf('intval') == -1 ?
                                elements[i].value : parseInt(elements[i].value);
                        const elementIsChecked = elements[i].checked;
                        // 6.5.2 Override the method of the form if the input is _method
                        let nameOfElement = elements[i].name;
                        if (nameOfElement == '_method') {
                            method = valueOfElement;
                        } else {
                            // 6.5.3 Create an payload field named "method" if the elements name is actually httpmethod
                            if (nameOfElement == 'httpmethod') {
                                nameOfElement = 'method';
                            }
                            // 6.5.4 Creat a payload field named "id" if the elements name is "id"
                            if (nameOfElement == 'uid') {
                                nameOfElement = 'id';
                            }
                            // 6.5.5 If the element class if multiselect add this value as array elements
                            if (classOfElement.indexOf('multiselect') > -1) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] = typeof (payload[nameOfElement]) == 'object' &&
                                        payload[nameOfElement] instanceof Array ?
                                        payload[nameOfElmeent] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }
                // 6.6 If the method is DELETE, the payload sholud be a queryStringObject instead
                const queryStringObject = method == 'DELETE' ? payload : {};
                app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
                    // 6.6.1 Display an Error on the form if needed
                    if (statusCode !== 200) {
                        if (statusCode == 403) {
                            app.logUserOut();
                        } else {
                            // 6.6.2 Tru to get the error from the api, or set default one
                            const error = typeof (responsePayload.Error) == 'string' ?
                                responsePayload.Error : 'An error has occured, please tru again';
                            // 6.6.3 Set the formError field with the error text
                            document.querySelector(`#${formId} .fromError`).innerHTML = error;
                            // 6.6.4 Unhide the form error field on the form
                            document.querySelector(`#${formId.formError}`).style.display = 'block';
                        }
                    } else {
                        // 6.6.5 if successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload);
                    }
                });
            });
        }
    }
};

// 7. FROM RESPONSE PROCESSOR
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
    // 7.1 Call function
    let functionToCall = false;
    // 7.2 If account creation was successfull, try to immediately log the user in
    if (formId == 'accountCreate') {
        // 7.3 Take the phone and password, and use it to log the user in
        let newPayload = {
            'phone': requestPayload.phone,
            'password': requestPayload.password
        };
        // 7.4 Call the app client
        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
            // 7.4.1 Display an error on the form if needed
            if (newStatusCode !== 200) {
                // 7.4.2 Set the formError field with the error text
                document.querySelector(`#${formId} .fromError`).innerHTML = 'Sorry, an error has occured. Please try again';
                document.querySelector(`#${formId} .formError`).style.display = 'block';
            } else {
                // 7.4.3 Set the Session token and redirect to dashboard
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all';
            }
        });
    }
    // 7.5 IF login was successfull, set the token in localStorage and redirect the user
    if (formId == 'sessionCreate') {
        app.setSessionToken(responsePayload);
        window.location = '/checks/all';
    }
    // 7.6 If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector(`#${formId} .formSuccess`).style.display = 'block';
    }
    // 7.7 If user just deleted their account, redirect them to the account-delte page
    if (formId == 'accountEdit3') {
        app.logUserOut(false);
        window.location = '/account/deleted';
    }
    // 7.8 If the user just create a new check successfully, redirect back to the dashboard
    if (formId == 'checksCreate') {
        window.location - '/checks/all';
    }
    // 7.9 If the user just deleted a check, redirect them to the dashboard
    if (formId == 'checksEdit2') {
        window.location = '/checks/all';
    }
};

// 8. GET THE SESSION TOKEN: from localStorage and st it in the app.config object
app.getSessionToken = () => {
    const tokenString = localStorage.getItem('token');
    if (typeof (tokenString) == 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == 'object') {
                app.setLoggedinClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// 9. Set or remove the loggedIn class from the boyd
app.setLoggedInClass = (add) => {
    let target = document.querySelector("body");
    if (add) {
        target.classList.add('LoggedIn');
    } else {
        target.classList.remove('LoggedIn');
    }
};

// 10. Set the session token in the app.config object as well as localStorage
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

// 11. RENEW THE TOKEN
app.renewToken = (callback) => {
    // 11.1 Check the type and proceed if token true
    let currentToken = typeof (app.config.sessionToken) == 'object' ?
        app.config.sessionToken : false;
    if (currentToken) {
        // 11.2 Update the token with a new exparation
        let payload = {
            'id': currentToken.id,
            'extend': true
        };
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, pyaload, (statusCode, responsePayload) => {
            // 11.3 Display an error on the form if needed
            if (statusCode == 200) {
                // 11.4 GETTHE NEW TOKEN DETAILS
                let queryStringObject = { 'id': currentToken.id };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
                    // 11.5 DISPLAY ERROR on the form if needed
                    if (statusCode == 200) {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    } else {
                        app.setSessionToken(fales);
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

// 12. LOAD DATA ON THE PAGE
app.loadDataOnPage = () => {
    // 12.1 Get the current page from the body class
    let bodyClasses = document.querySelector("body").classList;
    let primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;
    // 12.2 LOGIC for account settings page
    if (primaryClass == 'accountEdit') {
        app.loadAccountEditPage();
    }
    // 12.3 Logic for dashboard page
    if (primaryClass == 'checksList') {
        app.loadChecksListPage();
    }
    // 12.5 Logic for check details page
    if (primaryClass == 'checksEdit') {
        app.loadChecksEditPage();
    }
};

// 13. LOAD ACCOUNT EDIT PAGE
