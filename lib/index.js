"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reporter_1 = require("@acot/reporter");
const core_1 = require("@octokit/core");
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
    let body = `Audit by acot (core: ${runner.version.core}, runner: ${runner.version.self})\n\n`;
    runner.on("audit:complete", async ([summary]) => {
        // Summarize by paths
        body +=
            summary.results
                .map((result) => {
                return `${result.url}:  :white_check_mark: ${result.passCount}  :x: ${result.errorCount}  :warning: ${result.warningCount}`;
            })
                .join("\n") + "\n\n";
        // Summarize by rules
        body += Object.entries(summary.rules)
            .map(([name, rule]) => {
            return `${name}:  :white_check_mark: ${rule.passCount}  :x: ${rule.errorCount}  :warning: ${rule.warningCount}`;
        })
            .join("\n");
        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            ...opts,
            body,
        });
    });
});
