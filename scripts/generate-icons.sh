#!/bin/bash

# Generate PWA icons from SVG
# This script requires ImageMagick or rsvg-convert

ICON_SVG="public/icons/icon.svg"
ICONS_DIR="public/icons"

# Icon sizes needed for PWA
SIZES=(16 32 72 96 128 144 152 192 384 512)

echo "Generating PWA icons..."

# Check if we have rsvg-convert (preferred) or ImageMagick
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg-convert"
    echo "Using rsvg-convert"
elif command -v magick &> /dev/null; then
    CONVERTER="magick"
    echo "Using ImageMagick"
elif command -v convert &> /dev/null; then
    CONVERTER="convert"
    echo "Using ImageMagick (convert)"
else
    echo "Error: Neither rsvg-convert nor ImageMagick found."
    echo "Please install one of them:"
    echo "  brew install librsvg  # for rsvg-convert"
    echo "  brew install imagemagick  # for ImageMagick"
    exit 1
fi

# Generate icons
for size in "${SIZES[@]}"; do
    output_file="${ICONS_DIR}/icon-${size}x${size}.png"
    
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w $size -h $size "$ICON_SVG" -o "$output_file"
    elif [ "$CONVERTER" = "magick" ]; then
        magick "$ICON_SVG" -resize ${size}x${size} "$output_file"
    else
        convert "$ICON_SVG" -resize ${size}x${size} "$output_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo "Generated: $output_file"
    else
        echo "Failed to generate: $output_file"
    fi
done

# Create maskable icons (same as regular for now)
cp "${ICONS_DIR}/icon-192x192.png" "${ICONS_DIR}/maskable-icon-192x192.png"
cp "${ICONS_DIR}/icon-512x512.png" "${ICONS_DIR}/maskable-icon-512x512.png"

# Create additional icons
cp "${ICONS_DIR}/icon-72x72.png" "${ICONS_DIR}/badge-72x72.png"
cp "${ICONS_DIR}/icon-96x96.png" "${ICONS_DIR}/camera-96x96.png"
cp "${ICONS_DIR}/icon-96x96.png" "${ICONS_DIR}/history-96x96.png"
cp "${ICONS_DIR}/icon-96x96.png" "${ICONS_DIR}/admin-96x96.png"

# Create favicon
cp "${ICONS_DIR}/icon-32x32.png" "public/favicon.ico"

echo "Icon generation complete!"
echo "Generated icons for sizes: ${SIZES[*]}"
