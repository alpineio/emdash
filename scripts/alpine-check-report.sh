#!/usr/bin/env bash
# Files a failed weekly upstream check on the open upstream-sync issue,
# creating the issue if none is open. Called by each job of
# .github/workflows/alpine-upstream-check.yml with its step outcomes in the
# environment: JOB, RUN_URL, BEHIND, UPSTREAM_SHA, REBASE, INSTALL, BUILD, TEST.
set -euo pipefail

body="$RUNNER_TEMP/issue.md"
{
	echo "The weekly upstream check for \`$BRANCH\` failed in **$JOB** against upstream \`$UPSTREAM_SHA\` ($BEHIND new upstream commits)."
	echo
	echo "Run: $RUN_URL"
	echo
	if [ "$REBASE" = "failure" ]; then
		echo "**The rebase hit conflicts** in:"
		echo
		sed 's/^/- `/; s/$/`/' "$RUNNER_TEMP/conflicts.txt" 2>/dev/null || true
		echo
		echo "Resolve locally: \`git fetch upstream && git checkout $BRANCH && scripts/alpine-rebase.sh\`."
	elif [ "$INSTALL" = "failure" ]; then
		echo "**The rebase was clean, but \`pnpm install\` failed.** See the run log."
	elif [ "$BUILD" = "failure" ]; then
		echo "**The rebase was clean, but the build failed.** See the run log."
	elif [ "$TEST" = "failure" ]; then
		echo "**The rebase was clean, but tests failed.** Failing lines:"
		echo
		echo '```'
		sed 's/\x1b\[[0-9;]*m//g' "$RUNNER_TEMP/test.log" | grep -E 'FAIL |✗|×|Test Files .*failed|Tests .*failed|Cannot connect to the iframe|ERR_PNPM' | head -60 || true
		echo '```'
	else
		echo "**The check failed before the tests ran.** See the run log."
	fi
} > "$body"

gh label create "$LABEL" --color D93F0B --description "Weekly upstream sync check" --force
existing=$(gh issue list --label "$LABEL" --state open --json number --jq '.[0].number')
if [ -n "$existing" ]; then
	gh issue comment "$existing" --body-file "$body"
else
	gh issue create --title "Upstream sync check failed for $BRANCH" --label "$LABEL" --body-file "$body"
fi
