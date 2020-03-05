import { execSync } from "child_process";
import axios from "axios";
import nock = require("nock");

import oauthCLI from "../index";

jest.mock("child_process");

describe("@node-cli-toolkit/oauth-cli", () => {
  it("should perform an oauth flow using no strategy", async done => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      expect(
        (await axios.get("http://localhost:8888/auth/callback?code=123")).data
      ).toEqual("You have successfully logged in! You can close the browser");
    }, 500);

    // when the request starts, we make a redirect to the oauth server
    // `authorizationURL`. Usually it would have a login page where the
    // user clicks "Login" and enters their details. We just mock that
    // server here (it doesn't need to have a log in page, just needs
    // to response with a 200 code) so that later we can mock a response
    nock(
      "http://oauthprovider.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=key"
    )
      .get(/.*/)
      .reply(200, {
        status: "I am the oauth server"
      });

    // we are mocking the token request inside of oauth library
    nock("http://oauthprovider.com/token")
      .post(/.*/)
      .reply(200, {
        access_token: "I_AM_THE_TOKEN",
        refresh_token: "REFRESH_TOKEN"
      });

    expect(
      await oauthCLI({
        authorizationURL: "http://oauthprovider.com/oauth2/authorize",
        tokenURL: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret"
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN"
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "http://oauthprovider.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=key"`
      )
    );
    done();
  });

  it.todo("should perform an oauth flow using a passed in strategy");

  it.todo("should be able to save token to file");

  it.todo("should handle CSRF validation");

  it.todo("should work on a different port, redirect URL, and domain");

  it.todo("should use a different port if one is taken");

  it.todo("should kill the server on error");

  it.todo("should work with a custom callbackURL");
});
