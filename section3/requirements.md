## Rquirements for the API

# Uptime monitoring app

# I.   The API listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE and HEAD;

# II.  The API allows a client to connect, then create a new user, then edit and delete that user;

# III. The API allows a user to "sing in" which gives them a token that they can use for subsequent authenticated requests;

# IV.  The API allows the user to "sing out" which invalidates their token;

# V.   The API allows a signed-in user to use their token to create a new "check';

# VI.  The API allows a signed-in user to edit or delete any of their checks;

# VII. In the background, workers perform all the "checks" at the appropriate times, and send alerts to the users when a check changes its state form "up" to "down", or visa versa;

# External API used: for SMS use Twilio.