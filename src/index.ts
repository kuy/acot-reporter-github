import { createReporterFactory } from "@acot/reporter";
import { Octokit } from "@octokit/core";
import { getMarkdownTable, Row } from "markdown-table-ts";
import ms from "pretty-ms";
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

  let body = `Audit by acot (core: ${runner.version.core}, runner: ${runner.version.self})\n\n`;
  const res = await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      ...opts,
      body: body + "<b>Results:</b> `Running...`\n",
    }
  );

  const commentId = res.data.id;
  debug(`comment_id: ${commentId}`);

  runner.on("audit:complete", async ([summary]) => {
    // Expandable: See details
    let details = "<details>\n";
    details += `<summary>See details</summary>\n\n`;
    details += `#### Summary by Path\n`;

    const stats = {
      pass: 0,
      error: 0,
      warning: 0,
    };

    summary.results.forEach((result) => {
      details += "<details>\n";
      details += `<summary>${result.url}:  :white_check_mark: ${result.passCount}  :x: ${result.errorCount}  :warning: ${result.warningCount}</summary>\n\n`;
      details += `#### Summary by Rule\n`;

      const rows: Row[] = [];
      for (const [id, stat] of Object.entries(result.rules)) {
        rows.push([
          "`" + id + "`",
          stat.passCount.toString(),
          stat.errorCount.toString(),
          stat.warningCount.toString(),
          ms(stat.duration),
        ]);

        stats.pass += stat.passCount;
        stats.error += stat.errorCount;
        stats.warning += stat.warningCount;
      }

      const input = {
        table: {
          head: ["Rule", ":white_check_mark:", ":x:", ":warning:", "Duration"],
          body: rows,
        },
      };
      details += `\n\n${getMarkdownTable(input)}\n\n`;

      details += "</details>\n";
    });

    details += "</details>";

    body += `<b>Results:</b> :white_check_mark: ${stats.pass}   :x: ${stats.error}   :warning: ${stats.warning}\n\n`;
    body += details;

    await octokit.request(
      "PATCH /repos/{owner}/{repo}/issues/{issue_number}/comments/{comment_id}",
      {
        ...opts,
        body,
        comment_id: commentId,
      }
    );
  });
});
