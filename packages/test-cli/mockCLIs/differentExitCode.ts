(async () => {
  console.log("Something bad is about to happen");
  console.error("Something bad happened");
  process.exit(1);
})();
