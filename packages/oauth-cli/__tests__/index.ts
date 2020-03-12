import { execSync } from "child_process";
import axios from "axios";
import { Strategy as DropboxOAuth2Strategy } from "passport-dropbox-oauth2";
import { v4 as uuid } from "uuid";

import { getToken } from "@node-api-toolkit/save-token";

import oauthCLI from "../index";
import dropboxOauthMock from "../__mocks/dropboxOauth";
import oauthMock from "../__mocks/oauth";
import dropboxOauthSimulateCallback from "../__mocks/dropboxOauthSimulateCallback";

jest.mock("child_process");

describe("@node-cli-toolkit/oauth-cli", () => {
  it("should perform an oauth flow using the default strategy", async done => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      expect(
        (await axios.get("http://localhost:8888/auth/callback?code=123")).data
      ).toEqual("You have successfully logged in! You can close the browser");
    }, 500);

    oauthMock();

    expect(
      await oauthCLI({
        authorizationURL: "http://oauthprovider.com/oauth2/authorize",
        tokenURL: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret"
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      user: {}
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "http://oauthprovider.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=key"`
      )
    );
    done();
  });

  it("should perform an oauth flow using a passed in strategy", async done => {
    // simulate a redirect from the oauth server (user logged in)
    // and expect a successful login
    const dropboxOauthSimulateCallbackPromise = dropboxOauthSimulateCallback();

    // we don't await it because we need `oauthCLI` to start the server first
    expect(dropboxOauthSimulateCallbackPromise).resolves.toEqual(
      "You have successfully logged in! You can close the browser"
    );

    dropboxOauthMock();

    expect(
      await oauthCLI({
        oauthStrategy: DropboxOAuth2Strategy,
        oauthStrategyOptions: {
          apiVersion: "2"
        },
        mutateUser: profile => ({
          userId: profile.id,
          email: profile.emails[0].value,
          name: {
            givenName: profile.name.givenName,
            familyName: profile.name.familyName,
            displayName: profile.displayName
          },
          // any other user details
          profile
        }),
        appSecret: "SECRET",
        appKey: "KEY"
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      user: {
        userId: "123",
        email: "franz@dropbox.com",
        name: {
          givenName: "Franz",
          familyName: "Ferdinand",
          displayName: "Franz Ferdinand (Personal)"
        },
        profile: expect.anything()
      }
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=KEY"`
      )
    );
    done();
  });

  it("should be able to save token to file using tokenIdentifier", async done => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      expect(
        (await axios.get("http://localhost:8888/auth/callback?code=123")).data
      ).toEqual("You have successfully logged in! You can close the browser");
    }, 500);

    oauthMock();

    expect(
      await oauthCLI({
        authorizationURL: "http://oauthprovider.com/oauth2/authorize",
        tokenURL: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret",
        saveTokenToFile: true,
        tokenIdentifier: "NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST"
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      user: {}
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "http://oauthprovider.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=key"`
      )
    );

    const token = await getToken({
      tokenIdentifier: "NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST"
    });

    expect(token).toEqual("I_AM_THE_TOKEN");

    done();
  });

  it("should be able to save token to file using tokenPath", async done => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      expect(
        (await axios.get("http://localhost:8888/auth/callback?code=123")).data
      ).toEqual("You have successfully logged in! You can close the browser");
    }, 500);

    oauthMock();

    const tokenPath = `/tmp/node-api-toolkit-save-token-test-custom-file-${uuid()}`;

    expect(
      await oauthCLI({
        authorizationURL: "http://oauthprovider.com/oauth2/authorize",
        tokenURL: "http://oauthprovider.com/token",
        appKey: "key",
        appSecret: "secret",
        saveTokenToFile: true,
        tokenPath
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      user: {}
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "http://oauthprovider.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=key"`
      )
    );

    const token = await getToken({
      filePath: tokenPath
    });

    expect(token).toEqual("I_AM_THE_TOKEN");

    done();
  });

  it("should accept strategy as a string", async done => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      expect(
        (await axios.get("http://localhost:8888/auth/callback?code=123")).data
      ).toEqual("You have successfully logged in! You can close the browser");
    }, 500);

    dropboxOauthMock();

    expect(
      await oauthCLI({
        oauthStrategy: "passport-dropbox-oauth2",
        oauthStrategyOptions: {
          apiVersion: "2"
        },
        mutateUser: profile => ({
          userId: profile.id,
          email: profile.emails[0].value,
          name: {
            givenName: profile.name.givenName,
            familyName: profile.name.familyName,
            displayName: profile.displayName
          },
          // any other user details
          profile
        }),
        appSecret: "SECRET",
        appKey: "KEY"
      })
    ).toEqual({
      accessToken: "I_AM_THE_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      user: {
        userId: "123",
        email: "franz@dropbox.com",
        name: {
          givenName: "Franz",
          familyName: "Ferdinand",
          displayName: "Franz Ferdinand (Personal)"
        },
        profile: expect.anything()
      }
    });

    expect(execSync).toBeCalledWith(
      expect.stringContaining(
        `open "https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fauth%2Fcallback&client_id=KEY"`
      )
    );
    done();
  });

  it.todo("should handle CSRF validation");

  it.todo("should work on a different port, redirect URL, and domain");

  it.todo("should use a different port if one is taken");

  it.todo("should kill the server on error");

  it.todo("should work with a custom callbackURL");
});
