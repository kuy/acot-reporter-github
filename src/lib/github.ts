export const get_pr_number = () => {
  const ref = load_gh_ref();
  return parse_pr_number(ref);
};

const PR_NUM_EXTRACTOR = /refs\/pull\/(\d+)\/merge/;
export const parse_pr_number = (ref: string) => {
  const matched = ref.match(PR_NUM_EXTRACTOR);
  if (!matched) {
    throw new Error(`Unexpected ref pattern. ref=${ref}`);
  }
  return parseInt(matched[1], 10);
};

export const load_gh_ref = () => {
  const ref = process.env.GITHUB_REF;
  if (!ref) {
    throw new Error(`GITHUB_REF not found. Not run on GitHub Actions?`);
  }
  return ref;
};

export const get_owner = () => {
  const repo = load_gh_repository();
  const [owner, _] = parse_owner_and_repo(repo);
  return owner;
};

export const get_repo_name = () => {
  const repo = load_gh_repository();
  const [_, repo_name] = parse_owner_and_repo(repo);
  return repo_name;
};

export const parse_owner_and_repo = (repo: string) => {
  const tokens = repo.split("/");
  if (tokens.length !== 2) {
    throw new Error(`Tokens should have just two, but ${tokens.length}`);
  }
  return tokens;
};

export const load_gh_repository = () => {
  const path = process.env.GITHUB_REPOSITORY;
  if (!path) {
    throw new Error(`GITHUB_REPOSITORY not found. Not run on GitHub Actions?`);
  }
  return path;
};
