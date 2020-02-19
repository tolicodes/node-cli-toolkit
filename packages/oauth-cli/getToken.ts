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
  return {
    token: "I_AM_THE_TOKEN",
    tokenType: "Bearer",
    userId: "789"
  };
};
