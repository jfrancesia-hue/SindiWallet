# Branch Protection Rules

Configure these rules in GitHub Settings > Branches > Add rule for `main`:

## Required settings

- **Branch name pattern**: `main`
- **Require a pull request before merging**: Yes
  - Required approving reviews: 1
  - Dismiss stale reviews: Yes
- **Require status checks to pass before merging**: Yes
  - Required checks:
    - `Lint`
    - `Unit Tests`
    - `E2E Tests`
    - `Build`
- **Require branches to be up to date before merging**: Yes
- **Require conversation resolution before merging**: Yes

## Optional settings

- **Restrict who can push to matching branches**: Administrators only
- **Allow force pushes**: No
- **Allow deletions**: No

## Setup via GitHub CLI

```bash
gh api repos/jfrancesia-hue/SindiWallet/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint","Unit Tests","E2E Tests","Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```
