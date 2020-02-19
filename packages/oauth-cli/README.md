# OAuth CLI

A Node utility that opens the Oauth URL, starts an express server which listens for the redirect when
the user logs in. the Redirect Server makes a request to the tokenUrl and returns
back the token in the response. It resolves the promise of the OAuthCLI with the token

## Usage

```js
await oauthCLI({
  url: "http://oauthprovider.com/oauth",
  tokenUrl: "http://oauthprovider.com/token",
  appKey: "key",
  appSecret: "secret"
});
```

Returns:
The token, tokenType (ex: Bearer), and userID

```js
{
  token: "I_AM_THE_TOKEN",
  tokenType: "Bearer",
  userId: "789"
}
```

## Options

- `url` - Initial OAuth URL (example: https://www.dropbox.com/1/oauth2/authorize)
- `tokenUrl` - The URL to fetch the token (example: https://api.dropbox.com/1/oauth2/token)
- `appKey` - The App Key (aka as the clientID) (ex: 32d93023sdsd)
- `appSecret` - The App Secret (ex: 320s9329s0)

### Optional

- `redirectURI` - (optional) The URI of our local server (default: http://localhost:8888/redirect)
- `serverRedirectPath` - (optional) The path on our local server to redirect to (default: /redirect)
- `serverPort` - (optional) The port our local server is run on (default: 8888)
- `responseType` - (optional) The response type from the first OAuth Request (default: code)
- `grantType` - (optional) The grant type for the token (default: authorization_code)

### Components

- [getOauthUrl](./getOauthUrl.ts): Gets the OAuth URL to open the browser to
- [getToken](./getToken.ts) Gets the token from the API server using the authorization code
- [responseServer](./responseServer.ts) Starts an express server which listens for the redirect when the user logs in. The Redirect Server makes a request to the tokenUrl and returns back the token in the response. It resolves the promise with the token

### Tests and Todos

Everything in this package is tested thoroughly. You can also see planned features as part of the tests' todos. See [**tests** directory](__tests__).
