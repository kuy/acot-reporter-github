import { createReporterFactory } from "@acot/reporter";
import { Octokit } from "@octokit/core";
import { getMarkdownTable, Row } from "markdown-table-ts";
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

  runner.on("audit:complete", async ([summary]) => {
    let body = `Audit by acot (core: ${runner.version.core}, runner: ${runner.version.self})\n\n`;

    // Expandable: See details
    body += "<details>\n";
    body += `<summary>See details</summary>\n`;

    summary.results.forEach((result) => {
      body += "<details>\n";
      body += `<summary>${result.url}:  :white_check_mark: ${result.passCount}  :x: ${result.errorCount}  :warning: ${result.warningCount}</summary>\n`;

      const rows: Row[] = [];
      for (const [id, stat] of Object.entries(result.rules)) {
        rows.push([
          id,
          stat.passCount.toString(),
          stat.errorCount.toString(),
          stat.warningCount.toString(),
          stat.duration.toString(),
        ]);
      }

      const input = {
        table: {
          head: ["Rule", ":white_check_mark:", ":x:", ":warning:", "Duration"],
          body: rows,
        },
      };
      body += `\n\n${getMarkdownTable(input)}\n\n`;

      body += "</details>\n";
    });

    body += "</details>";

    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        ...opts,
        body,
      }
    );
  });
});
