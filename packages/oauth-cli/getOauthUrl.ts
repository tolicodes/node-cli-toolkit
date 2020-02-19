import { DEFAULT_REDIRECT_URL } from "./responseServer";

export type GetOAuthUrlOpts = {
  url: string;
  clientID: string;
  state: string;

  redirectURI?: string;
  responseType?: string;
};

/**
 * Gets the OAuth URL to open the browser to
 *
 * @param url - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
 * @param clientID - The App Key (aka as the appKey) (ex: 32d93023sdsd)
 * @param state - The CSRF Token or UUID to check that it's the same user, we usually just pass a random UUID (ex: 320s9329s0)
 *
 * @returns The url to open
 */
export default ({
  url,
  clientID,
  state,

  redirectURI = DEFAULT_REDIRECT_URL,
  responseType = "code"
}: GetOAuthUrlOpts): string =>
  `${url}?client_id=${clientID}&response_type=${responseType}&redirect_uri=${redirectURI}&state=${state}`;
