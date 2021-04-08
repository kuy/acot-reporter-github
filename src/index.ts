import { createReporterFactory } from "@acot/reporter";
import { Octokit } from "@octokit/core";
import { get_owner, get_repo_name, get_pr_number } from "./lib/github";
const debug = require("debug")("kuy:reporter:github");

export default createReporterFactory(() => async (runner) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
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
      body: "acot STARTED",
    }
  );

  runner.on("audit:complete", async ([_summary]) => {
    debug("finished");

    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        ...opts,
        body: "acot FINISHED",
      }
    );
  });
});
