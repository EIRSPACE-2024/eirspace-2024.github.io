#!/usr/bin/env bash
set -euo pipefail

cat \
  resources/assets/styles.css \
  resources/assets/components.css \
  resources/assets/header.css \
  resources/assets/sections.css \
  resources/assets/rocket_drone_astro.css \
  resources/assets/team.css \
  resources/assets/partnership_video.css \
  resources/assets/footer.css \
  resources/assets/loading.css \
  > resources/assets/bundle.css

if command -v npx >/dev/null 2>&1; then
  npx --yes clean-css-cli resources/assets/bundle.css -o resources/assets/bundle.min.css
  echo "Generated resources/assets/bundle.min.css"
else
  cp resources/assets/bundle.css resources/assets/bundle.min.css
  echo "npx unavailable, copied bundle.css to bundle.min.css"
fi
