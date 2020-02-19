import { execSync } from "child_process";
import axios from "axios";
import moxios = require("moxios");

import oauthCLI from "../index";

jest.mock("child_process");

describe("@node-cli-toolkit/oauth-cli", () => {
  it("should perform an oauth flow", async () => {
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
      await oauthCLI({
        url: "http://oauthprovider.com/oauth",
        tokenUrl: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret"
      })
    ).toEqual({
      token: "I_AM_THE_TOKEN",
      tokenType: "Bearer",
      userId: "789"
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "http://oauthprovider.com/oauth?client_id=key&response_type=code&redirect_uri=http://localhost:8888/redirect&state=`
      )
    );
  });
});
