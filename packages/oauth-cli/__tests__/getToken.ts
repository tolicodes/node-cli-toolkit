import getToken from "../getToken";
import moxios = require("moxios");

describe("@cli-toolkit/oauth-cli/getToken", () => {
  it("should fetch token", async () => {
    moxios.install();

    // we are mocking the token request inside of /responseServer/getToken
    moxios.stubRequest(
      "http://oauthprovider.com/token?code=123&grant_type=authorization_code&client_id=key&client_secret=secret&redirect_uri=http://localhost:8888/redirect",
      {
        status: 200,
        response: {
          access_token: "I_AM_THE_TOKEN",
          token_type: "Bearer",
          uid: "789"
        }
      }
    );

    const token = await getToken({
      tokenUrl: "http://oauthprovider.com/token",
      code: "123",
      appKey: "key",
      appSecret: "secret",
      redirectUri: "http://localhost:8888/redirect"
    });

    expect(token).toEqual({
      token: "I_AM_THE_TOKEN",
      tokenType: "Bearer",
      userId: "789"
    });
  });

  it.todo("should handle errors from getting token");
});
