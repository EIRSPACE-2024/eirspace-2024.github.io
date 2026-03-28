#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/preview"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Symlinks keep preview lightweight and preserve relative asset paths.
ln -s ../resources "$OUT_DIR/resources"
ln -s ../static "$OUT_DIR/static"

read_front_matter() {
  local file="$1"
  awk '
    NR==1 && $0=="---" { in_fm=1; next }
    in_fm && $0=="---" { exit }
    in_fm { print }
  ' "$file"
}

read_content() {
  local file="$1"
  awk '
    NR==1 && $0=="---" { seen=1; next }
    seen==1 && $0=="---" { seen=2; next }
    seen==2 { print }
  ' "$file"
}

render_page() {
  local src_file="$1"
  local out_file="$2"

  local title="EIRSPACE"
  local loading_screen="true"
  local star_field="true"
  local include_loading_js="true"
  local include_shooting_stars_js="true"
  local include_typing_js="true"
  local in_styles="false"
  local -a page_styles=()

  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*styles:[[:space:]]*$ ]]; then
      in_styles="true"
      continue
    fi

    if [[ "$in_styles" == "true" && "$line" =~ ^[[:space:]]*-[[:space:]]*(.+)$ ]]; then
      page_styles+=("${BASH_REMATCH[1]}")
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*([a-z_]+):[[:space:]]*(.+)$ ]]; then
      in_styles="false"
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"
      case "$key" in
        title) title="$val" ;;
        loading_screen) loading_screen="$val" ;;
        star_field) star_field="$val" ;;
        include_loading_js) include_loading_js="$val" ;;
        include_shooting_stars_js) include_shooting_stars_js="$val" ;;
        include_typing_js) include_typing_js="$val" ;;
      esac
      continue
    fi

    in_styles="false"
  done < <(read_front_matter "$src_file")

  local content
  content="$(read_content "$src_file")"

  {
    cat <<EOF
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="static/logo/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="static/logo/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="static/logo/favicon-16x16.png">
    <link rel="stylesheet" href="resources/assets/styles.css">
    <link rel="stylesheet" href="resources/assets/header.css">
    <link rel="stylesheet" href="resources/assets/sections.css">
    <link rel="stylesheet" href="resources/assets/footer.css">
    <link rel="stylesheet" href="resources/assets/conversion.css">
    <link rel="stylesheet" href="resources/assets/loading.css">
EOF

    for stylesheet in "${page_styles[@]}"; do
      printf '    <link rel="stylesheet" href="%s">\n' "$stylesheet"
    done

    cat <<'EOF'
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400&display=swap">
</head>
<body>

  <a class="skip-link" href="#main-content">Aller au contenu principal</a>
EOF

    if [[ "$loading_screen" != "false" ]]; then
      cat <<'EOF'

    <!-- LOADING SCREEN -->
    <div id="loading-screen">
        <div id="loading-text">
            <span class="letter">E</span><span class="letter">i</span><span class="letter">R</span>
            <span class="letter">s</span><span class="letter">P</span><span class="letter">A</span>
            <span class="letter">C</span><span class="letter">E</span>
        </div>
    </div>
EOF
    fi

    cat <<'EOF'

    <!-- NAVBAR -->
    <nav class="navbar" id="navbar" role="navigation" aria-label="Navigation principale">
        <div class="logo-navbar"><a href="./index.html"><img loading="lazy" src="static/fonts/eirspace_navbar_logo.png" alt="Eirspace"></a></div>
        <ul class="nav-links">
            <li><a href="./team.html">TEAM</a></li>
            <li><a href="./rocket.html">ROCKET</a></li>
            <li><a href="./drone.html">DRONE</a></li>
            <li><a href="./astronomy.html">ASTRONOMY</a></li>
            <li><a href="./partnership.html">PARTNERSHIP</a></li>
        </ul>

        <div class="dropdown-menu">
        <button class="menu-toggle" onclick="toggleMenu()">☰</button>
        <ul class="dropdown-links">
            <li><a href="./team.html">TEAM</a></li>
            <li><a href="./rocket.html">ROCKET</a></li>
            <li><a href="./drone.html">DRONE</a></li>
            <li><a href="./astronomy.html">ASTRONOMY</a></li>
            <li><a href="./partnership.html">PARTNERSHIP</a></li>
            <li><a target="_blank" href="https://t.me/Eirspace_EMMK">TELEGRAM</a></li>
            <li><a target="_blank" href="https://www.instagram.com/eirspace_">INSTAGRAM</a></li>
            <li><a target="_blank" href="https://www.linkedin.com/company/eirspace">LINKEDIN</a></li>
            <li><a href="./video.html">VIDEO</a></li>
            <li><a href="./projects.html">PROJECTS</a></li>
        </ul>
        </div>
    </nav>
EOF

    if [[ "$star_field" != "false" ]]; then
      cat <<'EOF'

    <div class="star-field"></div>
    <div class="shooting-star-field"></div>
EOF
    fi

    cat <<'EOF'

    <main id="main-content" role="main">
EOF

    printf '\n%s\n' "$content"

    cat <<'EOF'
    </main>
EOF

    cat <<'EOF'

    <!-- FOOTER -->
    <footer class="footer">
        <div class="footer-content">
            <ul class="footer-links">
                <li><a href="./index.html">Home</a></li>
                <li><a href="./team.html">Team</a></li>
                <li><a href="./rocket.html">Rocket</a></li>
                <li><a href="./drone.html">Drone</a></li>
                <li><a href="./astronomy.html">Astronomy</a></li>
                <li><a href="./partnership.html">Partnership</a></li>
            </ul>

            <div class="footer-logo-center">
              <a href="./index.html">
                    <img loading="lazy" src="./static/logo/logo_eirspace_2425.webp" alt="Eirspace Logo">
                </a>
            </div>

            <ul class="social-links">
                <li>
                    <a href="https://www.instagram.com/eirspace_" target="_blank" aria-label="Instagram">
                        <img loading="lazy" src="./static/social/instagram.svg" alt="Instagram Logo">
                    </a>
                </li>
                <li>
                    <a href="https://www.linkedin.com/company/eirspace" target="_blank" aria-label="LinkedIn">
                        <img loading="lazy" src="./static/social/linkedin.svg" alt="LinkedIn Logo">
                    </a>
                </li>
                <li>
                    <a href="https://t.me/Eirspace_EMMK" target="_blank" aria-label="Telegram">
                        <img loading="lazy" src="./static/social/telegram.svg" alt="Telegram Logo">
                    </a>
                </li>
                <li>
                    <a href="https://github.com/EIRSPACE-2024" target="_blank" aria-label="Github">
                        <img loading="lazy" src="./static/social/github.svg" alt="Github Logo">
                    </a>
                </li>
                <li>
                    <a href="https://enseirb-matmeca.bordeaux-inp.fr/fr" target="_blank" aria-label="Enseirb">
                        <img loading="lazy" src="./static/social/enseirb.svg" alt="Enseirb Logo">
                    </a>
                </li>
            </ul>
        </div>

        <div class="footer-copyright">
            &copy; 2024 Eirspace. All rights reserved.
        </div>
    </footer>
EOF

    if [[ "$include_loading_js" != "false" ]]; then
      echo '<script src="resources/js/loading.js"></script>'
    fi
    if [[ "$include_shooting_stars_js" != "false" ]]; then
      echo '<script src="resources/js/shooting_stars.js"></script>'
    fi
    echo '<script src="resources/js/navbar.js"></script>'
    if [[ "$include_typing_js" != "false" ]]; then
      echo '<script src="resources/js/typing.js"></script>'
    fi

    cat <<'EOF'
</body>
</html>
EOF
  } > "$out_file"
}

cd "$ROOT_DIR"
for file in *.html; do
  if [[ -f "$file" ]] && head -n 1 "$file" | grep -q '^---$'; then
    render_page "$file" "$OUT_DIR/$file"
  fi
done

echo "Preview generated in: $OUT_DIR"
