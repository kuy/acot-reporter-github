import { createReporterFactory } from "@acot/reporter";
import { Octokit } from "@octokit/core";
import { get_owner, get_repo_name, get_pr_number } from "./lib/github";
const debug = require("debug")("kuy:reporter:github");

export default createReporterFactory(() => async (runner) => {
  debug("started");

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
      body: `Audit by acot (core: ${runner.version.core}, runner: ${runner.version.self})`,
    }
  );

  runner.on("audit:complete", async ([summary]) => {
    // Summarize by paths
    let body = summary.results
      .map((result) => {
        return `${result.url}:  :white_check_mark: ${result.passCount}  :x: ${result.errorCount}  :warning: ${result.warningCount}`;
      })
      .join("\n");
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        ...opts,
        body,
      }
    );

    // Summarize by rules
    body = Object.entries(summary.rules)
      .map(([name, rule]) => {
        return `${name}:  :white_check_mark: ${rule.passCount}  :x: ${rule.errorCount}  :warning: ${rule.warningCount}`;
      })
      .join("\n");
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        ...opts,
        body,
      }
    );
  });
});
