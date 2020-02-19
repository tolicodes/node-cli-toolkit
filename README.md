# CLI Toolkit

This is a collection of tools to make working with Node CLIs easier

## Tools

| Tool                              | Description                                                                                                                                                                                                                                                                    | Status  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| [oauth-cli](./packages/oauth-cli) | A Node utility that opens the Oauth URL, starts an express server which listens for the redirect when the user logs in. the Redirect Server makes a request to the tokenUrl and returns back the token in the response. It resolves the promise of the OAuthCLI with the token | Working |
