"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reporter_1 = require("@acot/reporter");
const core_1 = require("@octokit/core");
const markdown_table_ts_1 = require("markdown-table-ts");
const pretty_ms_1 = __importDefault(require("pretty-ms"));
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
            const rows = [];
            for (const [id, stat] of Object.entries(result.rules)) {
                rows.push([
                    "`" + id + "`",
                    stat.passCount.toString(),
                    stat.errorCount.toString(),
                    stat.warningCount.toString(),
                    pretty_ms_1.default(stat.duration),
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
            details += `\n\n${markdown_table_ts_1.getMarkdownTable(input)}\n\n`;
            details += "</details>\n";
        });
        details += "</details>";
        body += `<b>Results</b> :white_check_mark: ${stats.pass}   :x: ${stats.error}   :warning: ${stats.warning}\n\n`;
        body += details;
        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            ...opts,
            body,
        });
    });
});
