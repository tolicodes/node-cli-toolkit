import { execSync } from "child_process";
import { v4 as uuid } from "uuid";

import getOauthUrl, { GetOAuthUrlOpts } from "./getOauthUrl";
import responseServer, {
  ResponseServerOpts,
  ResponseServerReturn
} from "./responseServer";

// the appKey is actually the clientId
type OAuthCliOpts = Omit<Omit<GetOAuthUrlOpts, "clientID">, "state"> &
  ResponseServerOpts;

/**
 * Opens the Oauth URL, starts an express server which listens for the redirect when
 * the user logs in. the Redirect Server makes a request to the tokenUrl and returns
 * back the token in the response. It resolves the promise of the OAuthCLI with the
 * token
 *
 * @param url - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
 * @param tokenUrl - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
 * @param appKey - This is the app key you get from creating your Dropbox application 
 * (https://docs.gravityforms.com/creating-a-custom-dropbox-app/) (ex: 3u23809sd90239)
 * @param appSecret - This is the app secret you get from creating your Dropbox application
 * (ex: 3u23809sd90239)
 *
 * @param redirectURI - (optional) The URI of our local server (default: http://localhost:8888/redirect)
 * @param serverRedirectPath - (optional) The path on our local server to redirect to (default: /redirect)
 * @param serverPort - (optional) The port our local server is run on (default: 8888)
 * @param responseType - (optional) The response type from the first OAuth Request (default: code)
 * @param grantType - (optional) The grant type for the token (default: authorization_code)
 *
 * @returns The token, tokenType (ex: Bearer), and userID
 */
export default ({
  url,
  tokenUrl,
  appKey,
  appSecret,

  redirectURI,
  serverRedirectPath,
  serverPort,
  responseType,
  grantType
}: OAuthCliOpts): Promise<ResponseServerReturn> => {
  const responseServerPromise = responseServer({
    tokenUrl,
    appKey,
    appSecret,
    serverRedirectPath,
    serverPort,
    grantType
  });

  const oauthUrl = getOauthUrl({
    url,
    clientID: appKey,
    redirectURI,
    state: uuid(),
    responseType
  });

  execSync(`open "${oauthUrl}"`);

  return responseServerPromise;
};
