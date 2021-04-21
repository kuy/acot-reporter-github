"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reporter_1 = require("@acot/reporter");
const core_1 = require("@octokit/core");
const markdown_table_ts_1 = require("markdown-table-ts");
const github_1 = require("./lib/github");
const debug = require("debug")("kuy:reporter:github");
exports.default = reporter_1.createReporterFactory(() => async (runner) => {
    debug("started");
    const octokit = new core_1.Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
    const opts = {
        owner: github_1.get_owner(),
        repo: github_1.get_repo_name(),
        issue_number: github_1.get_pr_number(),
    };
    runner.on("audit:complete", async ([summary]) => {
        let body = `Audit by acot (core: ${runner.version.core}, runner: ${runner.version.self})\n\n`;
        // Expandable: See details
        body += "<details>\n";
        body += `<summary>See details</summary>\n`;
        summary.results.forEach((result) => {
            body += "<details>\n";
            body += `<summary>${result.url}:  :white_check_mark: ${result.passCount}  :x: ${result.errorCount}  :warning: ${result.warningCount}</summary>\n`;
            const rows = [];
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
            body += `\n\n${markdown_table_ts_1.getMarkdownTable(input)}\n\n`;
            body += "</details>\n";
        });
        body += "</details>";
        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            ...opts,
            body,
        });
    });
});
