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
