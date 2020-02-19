import getOauthUrl from "../getOauthUrl";

describe("@node-cli-toolkit/oauth-cli/getOauthUrl", () => {
  it("should return oauth redirect url with default parameters", async () => {
    expect(
      await getOauthUrl({
        url: "http://oauthprovider.com/oauth",
        clientID: "123",
        state: "456"
      })
    ).toEqual(
      `http://oauthprovider.com/oauth?client_id=123&response_type=code&redirect_uri=http://localhost:8888/redirect&state=456`
    );
  });
});
