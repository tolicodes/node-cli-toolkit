import axios from "axios";
import debug from "debug";

export default () =>
  new Promise(resolve => {
    // we have start this after the command is run which starts the server
    setTimeout(async () => {
      // simulate a redirect from the oauth server (user logged in)
      // and expect a successful login
      const response = (
        await axios.get("http://localhost:8888/auth/callback?code=123")
      ).data;

      debug("@node-cli-toolkit/oauth-cli/__mocks/dropboxOauthSimulateCallback")(
        response
      );

      resolve(response);
    }, 2000);
  });
