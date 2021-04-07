import { createReporterFactory } from "@acot/reporter";
const debug = require("debug")("kuy:reporter:github");

export default createReporterFactory(() => async (runner) => {
  debug("started");

  runner.on("audit:complete", async ([_summary]) => {
    debug("finished");
  });
});
