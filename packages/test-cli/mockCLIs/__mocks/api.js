const nock = require("nock");

module.exports = () => {
  nock("http://fakeserver.com/endpoint")
    .get(/.*/)
    .reply(200, {
      status: "I'm ok!"
    });
};
