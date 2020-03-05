import { execSync } from "child_process";
import passport = require("passport");
import Oauth2Strategy = require("passport-oauth2");
import express = require("express");
import url = require("url");
import axios from "axios";

export const SUCCESSFUL_LOGIN_MESSAGE =
  "You have successfully logged in! You can close the browser";

type OAuthCliOpts = {
  authorizationURL: string;
  tokenURL: string;
  appKey: string;
  appSecret: string;

  callbackURL?: string;
};

type OauthCLIReturn = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Opens the `authorizationURL` (on the oauth server), starts an express server
 * which listens for the redirect from the oauth server after the user logs in.
 * Then the oauth2 library makes a request to the `tokenUrl` and returns
 * back the token in the response. It resolves the promise of the OAuthCLI with the
 * `accessToken` and `refreshToken`
 *
 * @param authorizationURL - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
 * @param tokenURL - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
 * @param appKey - Aka the `clientID`. This is the app key you get from creating your Oauth application
 * (ex for Dropbox: https://docs.gravityforms.com/creating-a-custom-dropbox-app/) (ex: 3u23809sd90239)
 * @param appSecret - Aka the `clientSecret` This is the app secret you get from creating your Oauth
 * application (ex: 3u23809sd90239)
 *
 * @param callbackURL - (optional) The URI of our local server (default: http://localhost:8888/auth/callback)
 *
 * @returns The `accessToken` and `refreshToken`
 */
export default ({
  authorizationURL,
  tokenURL,
  appKey,
  appSecret,

  callbackURL = "http://localhost:8888/auth/callback"
}: OAuthCliOpts): Promise<OauthCLIReturn> =>
  new Promise(async resolve => {
    // we do this so that we can kill the server if there is any errors
    let server;

    // we need to do this so that we can resolve the promise on the
    // `/success` redirect (which does not have access to the `accessToken`
    // by default)
    let result;

    try {
      // we create a temporary response server
      // so that oauth can redirect back to it
      const app = express();

      // deconstruct the callbackURL so that
      // we can easily reference the path or host
      const {
        port: serverPort,
        host: serverHost,
        protocol: serverProtocol,
        path: callbackPath
      } = url.parse(callbackURL);

      // the server port from the `callbackURL`
      server = app.listen(serverPort);

      app.use(passport.initialize());

      // set up passport authentication strategy
      passport.use(
        new Oauth2Strategy(
          {
            authorizationURL,
            tokenURL,
            clientID: appKey,
            clientSecret: appSecret,
            callbackURL
          },
          async (accessToken, refreshToken, profile, done) => {
            // we save these so that we can officially resolve the
            // promise when we are redirected to `/success`
            result = {
              accessToken,
              refreshToken
            };

            // tell passport we are done
            // there is no profile by default
            done(null, {});
          }
        )
      );

      // this is where we start the authentication
      app.get("/start", passport.authenticate("oauth2"));

      app.get("/success", (req, res) => {
        // we need to send this so that the user can close the window
        res.send(SUCCESSFUL_LOGIN_MESSAGE);

        // we resolve with the result that we got in the previous callback
        server.close(() => {
          resolve(result);
        });
      });

      const fullAuthorizationURL = (
        await axios.get(`${serverProtocol}//${serverHost}/start`)
      ).request.response.responseUrl;

      app.get(
        callbackPath,
        passport.authenticate("oauth2", {
          session: false,
          successRedirect: "/success"
        })
      );

      execSync(`open "${fullAuthorizationURL}"`);
    } catch (e) {
      // if there is an error, close the server
      server.close(() => {
        throw e;
      });
    }
  });
