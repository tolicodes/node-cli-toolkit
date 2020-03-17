# @node-cli-toolkit/generate-oauth-token-cli

Generates an oauth token using the CLI and saves it to a file.

## Installation

```bash
yarn add @node-cli-toolkit/generate-oauth-token-cli
```

In your `package.json` add the following scripts:

```json
{
  "scripts": {
    "create-token-file": "generate-oauth-token-cli --saveTokenToFile --tokenIdentifier YOUR_TOKEN_ID --oauthStrategy passport-whatever-strategy --oauthStrategyOptions.someOption someValue  --appKey=$YOUR_APP_KEY --appSecret=$YOUR_APP_SECRET"
  }
}
```

## Usage

After you've added the command to your scripts you can run it using:

```bash
yarn run create-token-file
```

The command accepts the following flags:

- `saveTokenToFile`: Saves the token you generate to a file which can be retrieved using [`@node-cli-toolkit/save-token/getToken`](../save-token/README.md)
- `tokenIdentifier`: A unique identifier for your token. Check [`save-token` documentation](../save-token/README.md) for instructions on how to name your token
- `oauthStrategy`: The oauth passport strategy we are using to create the token (ex: `passport-dropbox-oauth2`)
- `oauthStrategyOptions.whateverOption`: Pass in any extra options for the `oauthStrategy` using dot notation. (ex: `--oauthStrategyOptions.apiVersion 2`)
- `appKey`: The app key for the oauth application you're trying to use. Recommended that you store this as an environmental variable in your `.zshrc` and reference it using `$WHATEVER_APP_KEY`
- `appSecret`: The app secret for the oauth application you're trying to use. Recommended that you store this as an environmental variable in your `.zshrc` and reference it using `$WHATEVER_APP_SECRET`

Other than that it will pass through any flags you pass as options to [`oauth-cli`](../oauth-cli)

## Tests and Todos

Everything in this package is tested thoroughly. You can also see planned features as part of the tests' todos. See [**tests** directory](__tests__).
