"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reporter_1 = require("@acot/reporter");
const core_1 = require("@octokit/core");
const github_1 = require("./lib/github");
const debug = require("debug")("kuy:reporter:github");
exports.default = reporter_1.createReporterFactory(() => async (runner) => {
    const octokit = new core_1.Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
    const opts = {
        owner: github_1.get_owner(),
        repo: github_1.get_repo_name(),
        issue_number: github_1.get_pr_number(),
    };
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        ...opts,
        body: "acot STARTED",
    });
    runner.on("audit:complete", async ([_summary]) => {
        debug("finished");
        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            ...opts,
            body: "acot FINISHED",
        });
    });
});
