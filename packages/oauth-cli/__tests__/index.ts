import { execSync } from "child_process";
import axios from "axios";
import nock = require("nock");
import { Strategy as DropboxOAuth2Strategy } from "passport-dropbox-oauth2";
import { v4 as uuid } from "uuid";

import { getToken } from "@node-api-toolkit/save-token";

import oauthCLI from "../index";

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
      "https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2F%2Flocalhost%3A8888%2Fauth%2Fdropbox%2Fcallback&client_id=KEY"
    )
      .get(/.*/)
      .reply(200, {
        status: "I am the oauth server"
      });

    // we are mocking the token request inside of oauth library
    nock("https://api.dropbox.com/oauth2/token/")
      .post(/.*/)
      .reply(200, {
        access_token: "I_AM_THE_TOKEN",
        refresh_token: "REFRESH_TOKEN"
      });

    // the callback endpoint then uses the token to reach out and get
    // the account details which have the account_id and some other
    // metadata
    nock("https://api.dropboxapi.com/2/users/get_current_account")
      .post(/.*/)
      // from https://www.dropbox.com/developers/documentation/http/documentation#users-get_current_account
      .reply(200, {
        account_id: "123",
        name: {
          given_name: "Franz",
          surname: "Ferdinand",
          familiar_name: "Franz",
          display_name: "Franz Ferdinand (Personal)",
          abbreviated_name: "FF"
        },
        email: "franz@dropbox.com",
        email_verified: true,
        disabled: false,
        locale: "en",
        referral_link: "https://db.tt/ZITNuhtI",
        is_paired: true,
        account_type: {
          ".tag": "business"
        },
        root_info: {
          ".tag": "user",
          root_namespace_id: "3235641",
          home_namespace_id: "3235641"
        },
        country: "US",
        team: {
          id: "dbtid:AAFdgehTzw7WlXhZJsbGCLePe8RvQGYDr-I",
          name: "Acme, Inc.",
          sharing_policies: {
            shared_folder_member_policy: {
              ".tag": "team"
            },
            shared_folder_join_policy: {
              ".tag": "from_anyone"
            },
            shared_link_create_policy: {
              ".tag": "team_only"
            }
          },
          office_addin_policy: {
            ".tag": "disabled"
          }
        },
        team_member_id: "dbmid:AAHhy7WsR0x-u4ZCqiDl5Fz5zvuL3kmspwU"
      });

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

  it.todo("should handle CSRF validation");

  it.todo("should work on a different port, redirect URL, and domain");

  it.todo("should use a different port if one is taken");

  it.todo("should kill the server on error");

  it.todo("should work with a custom callbackURL");
});
