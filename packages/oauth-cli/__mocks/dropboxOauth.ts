const nock = require("nock");

export default () => {
  // when the request starts, we make a redirect to the oauth server
  // `authorizationURL`. Usually it would have a login page where the
  // user clicks "Login" and enters their details. We just mock that
  // server here (it doesn't need to have a log in page, just needs
  // to response with a 200 code) so that later we can mock a response
  nock(
    "https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2F%2Flocalhost%3A8888%2Fauth%2Fdropbox%2Fcallback&client_id=KEY"
  )
    .get(/.*/)
    .reply(200, {
      status: "I am the oauth server"
    });

  // we are mocking the token request inside of oauth library
  nock("https://api.dropbox.com/oauth2/token/")
    .post(/.*/)
    .reply(200, {
      access_token: "I_AM_THE_TOKEN",
      refresh_token: "REFRESH_TOKEN"
    });

  // the callback endpoint then uses the token to reach out and get
  // the account details which have the account_id and some other
  // metadata
  nock("https://api.dropboxapi.com/2/users/get_current_account")
    .post(/.*/)
    // from https://www.dropbox.com/developers/documentation/http/documentation#users-get_current_account
    .reply(200, {
      account_id: "123",
      name: {
        given_name: "Franz",
        surname: "Ferdinand",
        familiar_name: "Franz",
        display_name: "Franz Ferdinand (Personal)",
        abbreviated_name: "FF"
      },
      email: "franz@dropbox.com",
      email_verified: true,
      disabled: false,
      locale: "en",
      referral_link: "https://db.tt/ZITNuhtI",
      is_paired: true,
      account_type: {
        ".tag": "business"
      },
      root_info: {
        ".tag": "user",
        root_namespace_id: "3235641",
        home_namespace_id: "3235641"
      },
      country: "US",
      team: {
        id: "dbtid:AAFdgehTzw7WlXhZJsbGCLePe8RvQGYDr-I",
        name: "Acme, Inc.",
        sharing_policies: {
          shared_folder_member_policy: {
            ".tag": "team"
          },
          shared_folder_join_policy: {
            ".tag": "from_anyone"
          },
          shared_link_create_policy: {
            ".tag": "team_only"
          }
        },
        office_addin_policy: {
          ".tag": "disabled"
        }
      },
      team_member_id: "dbmid:AAHhy7WsR0x-u4ZCqiDl5Fz5zvuL3kmspwU"
    });
};
