from PIL import Image
from pathlib import Path

SPRITE_DIR = Path("src/assets/pets/neko/sprites")

SPRITES = [
    "neko_idle",
    "neko_walk",
    "neko_look",
    "neko_stretch",
]


def remove_background(name: str):
    input_path = SPRITE_DIR / f"{name}_final.png"
    output_path = SPRITE_DIR / f"{name}_transparent.png"

    if not input_path.exists():
        print(f"Skipping {name}: {input_path} not found")
        return

    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]

            max_c = max(r, g, b)
            min_c = min(r, g, b)

            # Detect the gray checkerboard background.
            if max_c - min_c < 12 and max_c < 245:
                pixels[x, y] = (r, g, b, 0)

    img.save(output_path)

    print(f"Created: {output_path}")


for sprite in SPRITES:
    remove_background(sprite)