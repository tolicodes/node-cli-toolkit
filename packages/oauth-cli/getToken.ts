import axios from "axios";

export type GetTokenOpts = {
  tokenUrl: string;
  code: string;
  appKey: string;
  appSecret: string;
  redirectUri: string;

  grantType?: string;
};

export type GetTokenReturn = {
  token: string;
  tokenType: string;
  userId: string;
};

/**
 * Opens the Oauth URL, starts an express server which listens for the redirect when
 * the user logs in. the Redirect Server makes a request to the tokenUrl and returns
 * back the token in the response. It resolves the promise of the OAuthCLI with the
 * token
 *
 * @param tokenUrl - The URL to fetch the token (ex: https://api.dropbox.com/1/oauth2/token)
 * @param code - The authorization code from the oauth server (ex: 032isdi9323)
 * @param appKey - The App Key (aka as the clientID) (ex: 32d93023sdsd)
 * @param appSecret - The App Secret (ex: 320s9329s0)
 * @param redirectURI - The URI of our local server (ex: http://localhost:8888/redirect)
 *
 * @returns The token, tokenType (ex: Bearer), and userID
 */
export default async ({
  tokenUrl,
  code,
  appKey,
  appSecret,
  redirectUri,

  grantType = "authorization_code"
}: GetTokenOpts): Promise<GetTokenReturn> => {
  try {
    const { access_token: token, token_type: tokenType, uid: userId } = (
      await axios.post(
        `${tokenUrl}?code=${code}&grant_type=${grantType}&client_id=${appKey}&client_secret=${appSecret}&redirect_uri=${redirectUri}`
      )
    ).data;

    return {
      token,
      tokenType,
      userId
    };
  } catch (e) {
    throw new Error(
      `Error while getting token: ${e.response.data.error} ${e.response.data.error_description}`
    );
  }
};
