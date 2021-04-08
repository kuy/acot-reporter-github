import { createReporterFactory } from "@acot/reporter";
import type { Schema } from "@acot/schema-validator";
import { validate } from "@acot/schema-validator";
import { Octokit } from "@octokit/core";
import { get_owner, get_repo_name, get_pr_number } from "./lib/github";
const debug = require("debug")("kuy:reporter:github");

type Options = {
  token: string;
};

const schema: Schema = {
  type: "object",
  properties: {
    token: {
      type: "string",
    },
  },
  required: ["token"],
  additionalProperties: false,
};

export default createReporterFactory<Options>((config) => async (runner) => {
  validate(schema, config.options, {
    name: "GitHubReporter",
    base: "options",
  });

  debug("received valid options:", config.options);

  const octokit = new Octokit({
    auth: config.options.token,
  });

  const opts = {
    owner: get_owner(),
    repo: get_repo_name(),
    issue_number: get_pr_number(),
  };

  await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      ...opts,
      body: "STARTED",
    }
  );

  runner.on("audit:complete", async ([_summary]) => {
    debug("finished");

    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        ...opts,
        body: "FINISHED",
      }
    );
  });
});
