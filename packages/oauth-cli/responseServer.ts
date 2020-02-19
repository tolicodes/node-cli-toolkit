import express = require("express");
import getToken from "./getToken";

export const DEFAULT_REDIRECT_URL = "http://localhost:8888/redirect";

export type ResponseServerOpts = {
  tokenUrl: string;
  appKey: string;
  appSecret: string;

  serverPort?: number;
  serverRedirectPath?: string;
  grantType?: string;
};

export type ResponseServerReturn = {
  token: string;
  tokenType: string;
  userId: string;
};

/**
 * Starts an express server which listens for the redirect when the user logs in.
 * The Redirect Server makes a request to the tokenUrl and returns back the token
 * in the response. It resolves the promise with the token
 *
 * @param tokenUrl - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
 * @param appKey - The App Key (aka as the clientID) (ex: 32d93023sdsd)
 * @param appSecret - The App Secret (ex: 320s9329s0)
 *
 * @param serverPort - (optional) The port our local server is run on (default: 8888)
 * @param serverRedirectPath - (optional) The path on our local server to redirect to (default: /redirect)
 * @param grantType - (optional) The grant type for the token (default: authorization_code)
 *
 * @returns The token, tokenType (ex: Bearer), and userID
 */
export default async ({
  tokenUrl,
  appKey,
  appSecret,

  serverPort = 8888,
  serverRedirectPath = "/redirect",
  grantType = "authorization_code"
}: ResponseServerOpts): Promise<ResponseServerReturn> =>
  new Promise(resolve => {
    const app = express();
    const server = app.listen(serverPort);

    // if there is an error we close the server
    try {
      app.get(serverRedirectPath, async ({ query: { code } }, res) => {
        // @todo: do some check with state for CSRF with state that is passed in

        const { token, tokenType, userId } = await getToken({
          tokenUrl,
          code,
          grantType,
          appKey,
          appSecret,
          redirectUri: DEFAULT_REDIRECT_URL
        });

        server.close();

        res.json({
          token,
          tokenType,
          userId
        });

        resolve({
          token,
          tokenType,
          userId
        });
      });
    } catch (e) {
      server.close();
      throw e;
    }
  });
