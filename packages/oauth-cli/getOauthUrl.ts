import { DEFAULT_REDIRECT_URL } from "./responseServer";

export type GetOAuthUrlOpts = {
  url: string;
  clientID: string;
  state: string;

  redirectURI?: string;
  responseType?: string;
};

export default ({
  url,
  clientID,
  state,

  redirectURI = DEFAULT_REDIRECT_URL,
  responseType = "code"
}: GetOAuthUrlOpts): string =>
  `${url}?client_id=${clientID}&response_type=${responseType}&redirect_uri=${redirectURI}&state=${state}`;
