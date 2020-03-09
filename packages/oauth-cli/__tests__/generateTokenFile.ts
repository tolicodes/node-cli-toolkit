import testCLI from "@node-cli-toolkit/test-cli";
import { getToken } from "@node-api-toolkit/save-token";

describe("@node-cli-toolkit/oauth-cli/generateTokenCLI", () => {
  it("should be able to generate a token using command line arguments and save to file", async () => {
    // const { code, error } = await testCLI({
    //   nodeScriptPath: "./generateTokenCLI.ts",
    //   mockScriptPath: "./__tests__/mocks/dropboxOauthMock.ts",
    //   arguments: `--oauthStrategy passport-dropbox-oauth2 \
    //     --oauthStrategyOptions.apiVersion 2 \
    //     --appSecret SECRET \
    //     --appKey KEY \
    //     --saveTokenToFile true \
    //     --tokenIdentifier NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST_GENERATE_TOKEN_CLI`
    // });
    // expect(error.mock.calls.length).toBe(0);
    // expect(code).toBe(0);
    // const token = await getToken({
    //   tokenIdentifier: "NODE_CLI_TOOLKIT_OAUTH_TOKEN_JEST_GENERATE_TOKEN_CLI"
    // });
    // expect(token).toEqual("I_AM_THE_TOKEN");
  });
});
