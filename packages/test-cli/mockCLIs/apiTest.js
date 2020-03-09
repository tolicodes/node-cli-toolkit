const axios = require("axios");
(async () => {
  const { status } = (await axios.get("http://fakeserver.com/endpoint")).data;

  console.log(status);
})();
