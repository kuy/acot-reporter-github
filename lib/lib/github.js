"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load_gh_repository = exports.parse_owner_and_repo = exports.get_repo_name = exports.get_owner = exports.load_gh_ref = exports.parse_pr_number = exports.get_pr_number = void 0;
const get_pr_number = () => {
    const ref = exports.load_gh_ref();
    return exports.parse_pr_number(ref);
};
exports.get_pr_number = get_pr_number;
const PR_NUM_EXTRACTOR = /refs\/pull\/(\d+)\/merge/;
const parse_pr_number = (ref) => {
    const matched = ref.match(PR_NUM_EXTRACTOR);
    if (!matched) {
        throw new Error(`Unexpected ref pattern. ref=${ref}`);
    }
    return parseInt(matched[1], 10);
};
exports.parse_pr_number = parse_pr_number;
const load_gh_ref = () => {
    const ref = process.env.GITHUB_REF;
    if (!ref) {
        throw new Error(`GITHUB_REF not found. Not run on GitHub Actions?`);
    }
    return ref;
};
exports.load_gh_ref = load_gh_ref;
const get_owner = () => {
    const repo = exports.load_gh_repository();
    const [owner, _] = exports.parse_owner_and_repo(repo);
    return owner;
};
exports.get_owner = get_owner;
const get_repo_name = () => {
    const repo = exports.load_gh_repository();
    const [_, repo_name] = exports.parse_owner_and_repo(repo);
    return repo_name;
};
exports.get_repo_name = get_repo_name;
const parse_owner_and_repo = (repo) => {
    const tokens = repo.split("/");
    if (tokens.length !== 2) {
        throw new Error(`Tokens should have just two, but ${tokens.length}`);
    }
    return tokens;
};
exports.parse_owner_and_repo = parse_owner_and_repo;
const load_gh_repository = () => {
    const path = process.env.GITHUB_REPOSITORY;
    if (!path) {
        throw new Error(`GITHUB_REPOSITORY not found. Not run on GitHub Actions?`);
    }
    return path;
};
exports.load_gh_repository = load_gh_repository;
