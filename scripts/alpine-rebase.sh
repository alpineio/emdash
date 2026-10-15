#!/usr/bin/env bash
# Rebase the current branch onto upstream (default: upstream/main).
#
# pnpm-lock.yaml conflicts on almost every upstream update, because Alpine's
# packages add entries to it. When the lockfile is the only conflicted file,
# take upstream's copy, let pnpm add Alpine's entries back, and carry on.
# Any other conflict stops with the rebase left in progress, listing the files.
#
# Everything runs inside main(), which bash parses in full before running, so
# the rebase can rewrite this file without breaking the running script.

main() {
	set -euo pipefail
	local target="${1:-upstream/main}"

	if git rebase "$target"; then
		return 0
	fi

	while true; do
		local conflicts
		conflicts=$(git diff --name-only --diff-filter=U)
		if [ "$conflicts" != "pnpm-lock.yaml" ]; then
			echo "Rebase stopped on conflicts that need a person:" >&2
			echo "$conflicts" >&2
			return 1
		fi
		# During a rebase, --ours is the upstream side being rebased onto.
		git checkout --ours pnpm-lock.yaml
		pnpm install --lockfile-only --ignore-scripts
		git add pnpm-lock.yaml
		if GIT_EDITOR=true git rebase --continue; then
			return 0
		fi
	done
}

main "$@"
