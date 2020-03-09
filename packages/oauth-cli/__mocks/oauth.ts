import nock = require("nock");

export default () => {
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
};
