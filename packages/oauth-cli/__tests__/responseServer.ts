import responseServer from "../responseServer";
import axios from "axios";
import moxios = require("moxios");

describe("@cli-toolkit/oauth-cli/responseServer", () => {
  it("should accept a redirect request from the Oauth server", async () => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      const responseServerPromise = axios.get(
        "http://localhost:8888/redirect?code=123"
      );

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

      expect((await responseServerPromise).data).toEqual({
        token: "I_AM_THE_TOKEN",
        tokenType: "Bearer",
        userId: "789"
      });
    }, 500);

    expect(
      await responseServer({
        tokenUrl: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret"
      })
    ).toEqual({
      token: "I_AM_THE_TOKEN",
      tokenType: "Bearer",
      userId: "789"
    });
  });

  it.todo("should handle CSRF validation");

  it.todo("should work on a different port, redirect URL, and domain");

  it.todo("should use a different port if one is taken");

  it.todo("should kill the server on error");

  it.todo("should work with a custom redirectUri");
});
