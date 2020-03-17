# OAuth CLI

A Node utility that opens the `authorizationURL` (on the oauth server), starts an express server
which listens for the redirect from the oauth server after the user logs in.
Then the oauth2 library makes a request to the `tokenURL` and returns back the token in the response. It resolves the promise of the OAuthCLI with the `accessToken` and `refreshToken`.

You can either use oauth2 directly (passing in a `authorizationURL` and `tokenURL`) or pass in any passport strategy

## Installation

```bash
yarn add @node-cli-toolkit/oauth-cli
```

## Usage

### CLI Usage

Note that this package has a `CLI` avaialable where you can just pass in the options as arguments. See [`generate-oauth-token-cli`](../generate-oauth-token-cli) for details.

### Using Default Oauth2 Strategy

```js
import oauthCLI from "@node-cli-toolkit/oauth-cli";

await oauthCLI({
  authorizationURL: "http://oauthprovider.com/oauth",
  tokenUrl: "http://oauthprovider.com/token",
  appKey: "key",
  appSecret: "secret"
});
```

Returns:
The `accessToken`, `refreshToken`, `user`

```js
{
  accessToken: "I_AM_THE_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  user: {}
}
```

### Using Custom Passport Strategy

```js
import { Strategy as DropboxOAuth2Strategy } from "passport-dropbox-oauth2";
import oauthCLI from "@node-cli-toolkit/oauth-cli";

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
});
```

Returns:
The `accessToken`, `refreshToken`, `user`

```js
{
  accessToken: "I_AM_THE_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  user: {}
}
```

### Save token to a file using a Token Identifier

This is great for prototyping. It saves your token to
the file system in the `/tmp` folder with a unique token identifier. You can later retrieve it using `getToken` utility.

See [@node/api-toolkit/save-token](https://github.com/tolicodes/node-api-toolkit/tree/master/packages/save-token) for more info

```js
import oauthCLI from "@node-cli-toolkit/oauth-cli";

await oauthCLI({
  authorizationURL: "http://oauthprovider.com/oauth",
  tokenUrl: "http://oauthprovider.com/token",
  appKey: "key",
  appSecret: "secret",
  saveTokenToFile: true,
  tokenIdentifier: "NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST"
});
```

Returns:
The `accessToken`, `refreshToken`, `user`

```js
{
  accessToken: "I_AM_THE_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  user: {}
}
```

Saves token to `/tmp/NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST`

You can retrieve using

```js
import { getToken } from "@node-cli-toolkit/save-token";

const token = await getToken({
  tokenIdentifier: "NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST"
});
```

### Save token to a file using a Token Identifier

This is great for prototyping. It saves your token to
the file system in whatever file you choose. You can later retrieve it using `getToken` utility.

See [@node/api-toolkit/save-token](https://github.com/tolicodes/node-api-toolkit/tree/master/packages/save-token) for more info

```js
import oauthCLI from "@node-cli-toolkit/oauth-cli";

await oauthCLI({
  authorizationURL: "http://oauthprovider.com/oauth",
  tokenUrl: "http://oauthprovider.com/token",
  appKey: "key",
  appSecret: "secret",
  saveTokenToFile: true,
  tokenPath: "/tmp/node-api-toolkit-save-token-test-custom-file"
});
```

Returns:
The `accessToken`, `refreshToken`, `user`

```js
{
  accessToken: "I_AM_THE_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  user: {}
}
```

Saves token to `/tmp/node-api-toolkit-save-token-test-custom-file`

You can retrieve using:

```js
import { getToken } from "@node-cli-toolkit/save-token";

const token = await getToken({
  filePath: "/tmp/node-api-toolkit-save-token-test-custom-file"
});
```

## Options

### Required For All

- `appKey` - Aka the `clientID`. This is the app key you get from creating your Oauth application

* (ex for Dropbox: https://docs.gravityforms.com/creating-a-custom-dropbox-app/) (ex: 3u23809sd90239)

- `appSecret` - Aka the `clientSecret` This is the app secret you get from creating your Oauth

* application (ex: 3u23809sd90239)

### Using Default Strategy

- `authorizationURL` - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
- `tokenUrl` - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
- `callbackURL` - (optional) The URI of our local server (default: http://localhost:8888/redirect)

### Passing IN a Custom Strategy

- `oauthStrategy` - The Strategy constructor or `require`-able package name (ex: `DropboxOAuth2Strategy` or `passport-dropbox-oauth2`),
- `oauthStrategyOptions` - The custom options you need pass to the strategy besides the `appKey` and `appSecret`. Example:

  ```
  {
     apiVersion: "2"
  }
  ```

- `mutateUser` - (optional) - A parser for the user object (profile) you get back. Otherwise it just passes in the result

### Saving Token to A File

- `saveTokenToFile` - Should the token be saved to a file
- `tokenIdentifier` - If saving to a file, what should be the unique token identifier. See [@node/api-toolkit/save-token](https://github.com/tolicodes/node-api-toolkit/tree/master/packages/save-token) for more info
- `tokenPath` - If saving to a file, what should be the filename (if not using a token identifier)

## Tests and Todos

Everything in this package is tested thoroughly. You can also see planned features as part of the tests' todos. See [**tests** directory](__tests__).
