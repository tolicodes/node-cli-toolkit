import { execSync } from "child_process";
import passport = require("passport");
import Oauth2Strategy = require("passport-oauth2");
import express = require("express");
import url = require("url");
import axios from "axios";

export const SUCCESSFUL_LOGIN_MESSAGE =
  "You have successfully logged in! You can close the browser";

export type MutateUser = (user: any) => any;
export type OAuthCliOpts = {
  authorizationURL?: string;
  tokenURL?: string;
  // sometimes it doesn't have typings
  oauthStrategy?: any;
  oauthStrategyOptions?: object;
  mutateUser?: MutateUser;

  appKey: string;
  appSecret: string;

  callbackURL?: string;
};

export type OauthCLIReturn = {
  accessToken: string;
  refreshToken: string;
  user?: object;
};

/**
 * Opens the `authorizationURL` (on the oauth server), starts an express server
 * which listens for the redirect from the oauth server after the user logs in.
 * Then the oauth2 library makes a request to the `tokenUrl` and returns
 * back the token in the response. It resolves the promise of the OAuthCLI with the
 * `accessToken` and `refreshToken`
 *
 * If using the default strategy (passport-oauth):
 * @param authorizationURL - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
 * @param tokenURL - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
 * @param appKey - Aka the `clientID`. This is the app key you get from creating your Oauth application
 * (ex for Dropbox: https://docs.gravityforms.com/creating-a-custom-dropbox-app/) (ex: 3u23809sd90239)
 * @param appSecret - Aka the `clientSecret` This is the app secret you get from creating your Oauth
 * application (ex: 3u23809sd90239)
 *
 * @param callbackURL - (optional) The URI of our local server (default: http://localhost:8888/auth/callback)
 *
 * If passing in a strategy
 * @param oauthStrategy: - The Strategy constructor (ex: DropboxOAuth2Strategy),
 * @param oauthStrategyOptions - The custom options you need pass to the strategy besides the `appKey` and
 * `appSecret`. Example:
 * {
 *   apiVersion: "2"
 * },
 * @param mutateUser - (optional) - A parser for the user object (profile) you get back. Otherwise it just
 * passes in the result
 * @param appKey - Aka the `clientID`. This is the app key you get from creating your Oauth application
 * (ex for Dropbox: https://docs.gravityforms.com/creating-a-custom-dropbox-app/) (ex: 3u23809sd90239)
 * @param appSecret - Aka the `clientSecret` This is the app secret you get from creating your Oauth
 * application (ex: 3u23809sd90239)
 *
 * @returns The `accessToken`, `refreshToken`, and possibly a `user` with additional options
 */
export default ({
  authorizationURL,
  tokenURL,
  appKey,
  appSecret,

  oauthStrategy,
  oauthStrategyOptions,
  mutateUser,

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

      // we want to use the passed in strategy or the default
      // oauth2 strategy if it's not passed in
      const Strategy = oauthStrategy || Oauth2Strategy;

      // if we have strategyOpts (for a custom Oauth strategy)
      // then we merge them with the default opts (common to all
      // strategies). Otherwise we also need the `authorizationURL`
      // and `tokenURL`
      const strategyOpts = oauthStrategyOptions
        ? {
            clientID: appKey,
            clientSecret: appSecret,
            callbackURL,
            ...oauthStrategyOptions
          }
        : {
            authorizationURL,
            tokenURL,
            clientID: appKey,
            clientSecret: appSecret,
            callbackURL
          };

      const strategy = new Strategy(
        strategyOpts,
        async (accessToken, refreshToken, profile, done) => {
          // we save these so that we can officially resolve the
          // promise when we are redirected to `/success`
          result = {
            accessToken,
            refreshToken,
            user: mutateUser ? mutateUser(profile) : profile
          };

          // tell passport we are done
          // there is no profile by default
          done(null, {});
        }
      );

      // extract the strategy name from the strategy
      const strategyName = strategy.name;

      // set up passport authentication strategy
      passport.use(strategy);

      // this is where we start the authentication
      app.get("/start", passport.authenticate(strategyName));

      app.get("/success", (req, res) => {
        // we need to send this so that the user can close the window
        res.send(SUCCESSFUL_LOGIN_MESSAGE);

        // we resolve with the result that we got in the previous callback
        server.close(() => {
          resolve(result);
        });
      });

      // this is the authorization url with the key and callback
      // passed in. It's given as a redirect when we hit the /start
      // url
      const fullAuthorizationURL = (
        await axios.get(`${serverProtocol}//${serverHost}/start`)
      ).request.response.responseUrl;

      // setup the callback path (for when the oauth server responds)
      // we need a success redirect which will signify the end of the
      // authentication
      app.get(
        callbackPath,
        passport.authenticate(strategyName, {
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
