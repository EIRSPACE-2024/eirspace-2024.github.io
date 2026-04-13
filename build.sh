#!/usr/bin/env bash
set -euo pipefail

cat resources/assets/*.css | sed '/bundle\.min\.css/d' | sed '/bundle\.css/d' > resources/assets/bundle.css || true
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
  # Using python for minification fallback
  python3 -c "
import sys, re
with open('resources/assets/bundle.css', 'r') as f: css = f.read()
css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*([\{\}\:\;\,\>])\s*', r'\1', css)
css = re.sub(r';}', '}', css)
with open('resources/assets/bundle.min.css', 'w') as f: f.write(css.strip())
"
  echo "npx unavailable, created minified bundle.min.css via python fallback"
fi
