#!/bin/bash
# Font dosyalarını Google Fonts'tan indir

# DM Sans
curl -L "https://fonts.gstatic.com/s/dmsans/v14/rP2Hp2ywxg089UriCZOIHQ.woff2" -o dm-sans.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/dmsans/DMSans-Regular.ttf" -o dm-sans.ttf 2>/dev/null

# Lora
curl -L "https://fonts.gstatic.com/s/lora/v32/0QIvMX1D_JOuMw_LIftT.woff2" -o lora.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/lora/Lora-Regular.ttf" -o lora.ttf 2>/dev/null

# Lora Italic
curl -L "https://fonts.gstatic.com/s/lora/v32/0QIvMX1D_JOuMw_7IftT.woff2" -o lora-italic.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/lora/Lora-Italic.ttf" -o lora-italic.ttf 2>/dev/null

# IBM Plex Mono
curl -L "https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n1iIq129k.woff2" -o ibm-plex-mono.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf" -o ibm-plex-mono.ttf 2>/dev/null

# IBM Plex Mono Italic
curl -L "https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkqdyU8n1ioSGl5hg.woff2" -o ibm-plex-mono-italic.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Italic.ttf" -o ibm-plex-mono-italic.ttf 2>/dev/null

# AR One Sans
curl -L "https://fonts.gstatic.com/s/aronesans/v3/6qLVO3h4sPBHi0w1HkjJ9Hxhp8w.woff2" -o ar-one-sans.woff2 2>/dev/null || \
curl -L "https://github.com/google/fonts/raw/main/ofl/aronesans/AROneSans-Regular.ttf" -o ar-one-sans.ttf 2>/dev/null

# JetBrains Mono
curl -L "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2" -o jetbrains-mono.woff2 2>/dev/null || \
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf" -o jetbrains-mono.ttf 2>/dev/null

# JetBrains Mono Italic
curl -L "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2" -o jetbrains-mono-italic.woff2 2>/dev/null || \
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Italic.ttf" -o jetbrains-mono-italic.ttf 2>/dev/null

echo "Font dosyaları indirildi"
