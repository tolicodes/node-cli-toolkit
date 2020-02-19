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
