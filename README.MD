## AUTHENTICATION
# step1
https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=<CLIENT_ID>&redirect_uri=http://localhost:3000&scope=chat%3Aread+chat%3Aedit

# step2
curl --location 'https://id.twitch.tv/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=<CLIENT_ID>' \
--data-urlencode 'client_secret=<CLIENT_SECRET>' \
--data-urlencode 'code=<OAUTH_CODE>' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'redirect_uri=http://localhost:3000'

# step3
Ensure all env variables in particular OAuth access and refresh token are up to date before running. 
Also make sure redirect uri is configured correctly on twitch dev console