#!/bin/bash
set -e -u -o pipefail

version=$(jq <package.json -r '.version')
publish_opts=$(if echo "$version" | grep -q beta; then echo "--tag beta"; fi)

yarn build-lib
# shellcheck disable=SC2086
yarn publish $publish_opts --new-version "$version" --access=public dist/

git tag "v$version" -f
git push --tags
