# Hollow Brand Assets

Source files for the Hollow visual identity. Not consumed by the build directly — these regenerate the binary assets in `src-tauri/icons/`.

## Files

- `hollow-icon.svg` — 1024×1024 master mark. Three concentric ember rings on charcoal, cream punch at center. Mirrors the onboarding splash icon at marketing scale.

## Regenerating app icons

Tauri ships its own icon pipeline. Point it at a PNG (or SVG, in newer CLIs) and it produces every platform-specific size + `.ico` + `.icns` + Android Play-Store assets in one shot.

```bash
# 1. Rasterize the SVG to a 1024×1024 PNG.
#    Pick whichever you have installed:
npx --yes sharp-cli -i assets/hollow-icon.svg -o assets/hollow-icon.png resize 1024 1024
# OR (if ImageMagick):
magick convert -background none -resize 1024x1024 assets/hollow-icon.svg assets/hollow-icon.png
# OR (if Inkscape):
inkscape -w 1024 -h 1024 assets/hollow-icon.svg -o assets/hollow-icon.png

# 2. Run Tauri's icon generator. Overwrites src-tauri/icons/* in place.
npx tauri icon assets/hollow-icon.png
```

## What this replaces

The icons currently in `src-tauri/icons/` are the default Tauri scaffold mark (yellow + cyan twin-circle). They have no relationship to the Hollow identity and must be replaced before public release.

Do not commit binary icons by hand — always regenerate from the SVG above so the source-of-truth stays version-controlled.
